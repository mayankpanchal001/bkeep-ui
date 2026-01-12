import { ArrowDown, ArrowUp, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { useTransactions } from '../../services/apis/transactions';
import type { TransactionItem } from '../../types';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableHead,
    TableHeader,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
} from '../ui/table';

const TransactionsTable = () => {
    const { data, isLoading, isError, error } = useTransactions();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const itemsPerPage = 20;

    const transactions = data?.items || [];

    const filteredTransactions = transactions.filter((transaction: TransactionItem) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const firstSplit = transaction.splits?.[0];
        const description =
            firstSplit?.senderDescription?.toLowerCase() ||
            firstSplit?.recipientDescription?.toLowerCase() ||
            '';
        const categoryName =
            firstSplit?.categoryAndGifi?.[0]?.displayLabel?.toLowerCase() ||
            firstSplit?.categoryAndGifi?.[0]?.name?.toLowerCase() ||
            '';
        const itemType = transaction.itemType?.toLowerCase() || '';

        return (
            description.includes(searchLower) ||
            categoryName.includes(searchLower) ||
            itemType.includes(searchLower) ||
            transaction.totalAmount?.includes(searchLower)
        );
    });

    const totalPages = Math.ceil(
        filteredTransactions.length / itemsPerPage
    );
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const rowIds = paginatedTransactions.map((t: TransactionItem) => t.id);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2 shadow-sm border border-primary/10 p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/25 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-primary/50">
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">
                    Error: {error?.message || 'Failed to load transactions'}
                </p>
            </div>
        );
    }

    const handleBulkExport = () => {
        console.log('Exporting transactions:', selectedItems);
        setSelectedItems([]);
    };

    return (
        <div className="bg-white max-h-[calc(100vh-100px)] rounded-2 shadow-sm border border-primary/10 overflow-y-auto">
            {/* Table Header with Search */}
            <div className="p-4 border-b border-primary/10 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium text-primary">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
            >
                <TableSelectionToolbar>
                    <button
                        onClick={handleBulkExport}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                        Export Selected
                    </button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="latestPostedDate">
                            Date
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead align="right">Amount</TableHead>
                        <TableHead align="right">Balance</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Action</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {paginatedTransactions.length === 0 ? (
                        <TableEmptyState
                            colSpan={8}
                            message={
                                searchTerm
                                    ? 'No transactions found matching your search'
                                    : 'No transactions available'
                            }
                        />
                    ) : (
                        paginatedTransactions.map((transaction: TransactionItem) => {
                            const firstSplit = transaction.splits?.[0];
                            const description =
                                firstSplit?.senderDescription ||
                                firstSplit?.recipientDescription ||
                                transaction.itemType ||
                                'N/A';
                            const displayLabel =
                                firstSplit?.categoryAndGifi?.[0]?.displayLabel;
                            const amount = parseFloat(
                                transaction.totalAmount || '0'
                            );
                            const isCredit = amount >= 0;
                            const formattedAmount = new Intl.NumberFormat(
                                'en-US',
                                {
                                    style: 'currency',
                                    currency:
                                        transaction.currency?.toUpperCase() ||
                                        'USD',
                                }
                            ).format(Math.abs(amount));

                            return (
                                <TableRow
                                    key={transaction.id}
                                    rowId={transaction.id}
                                >
                                    <TableCell>
                                        <TableRowCheckbox
                                            rowId={transaction.id}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    isCredit
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                }`}
                                            ></div>
                                            <span className="text-sm font-medium text-primary">
                                                {new Date(
                                                    transaction.latestPostedDate ||
                                                        transaction.createdAt
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-primary">
                                                {description}
                                            </span>
                                            {displayLabel && (
                                                <span className="text-xs text-primary/50">
                                                    {displayLabel}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-primary/50 bg-primary/10 px-2 py-1 rounded">
                                            {transaction.itemType || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div
                                            className={`flex items-center justify-end gap-1 font-semibold ${
                                                isCredit
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {isCredit ? (
                                                <ArrowUp className="w-3 h-3" />
                                            ) : (
                                                <ArrowDown className="w-3 h-3" />
                                            )}
                                            <span>
                                                {isCredit ? '+' : '-'}
                                                {formattedAmount}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="text-sm text-primary/75">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency:
                                                    transaction.currency?.toUpperCase() ||
                                                    'USD',
                                            }).format(0)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {transaction.pending && (
                                                <span className="text-xs text-primary/50 bg-primary/10 px-2 py-1 rounded">
                                                    Pending
                                                </span>
                                            )}
                                            {firstSplit?.pendingTransfer && (
                                                <span className="text-xs text-primary/50 bg-primary/10 px-2 py-1 rounded">
                                                    Transfer
                                                </span>
                                            )}
                                            {transaction.matchedReceiptDocs &&
                                                transaction.matchedReceiptDocs
                                                    .length > 0 && (
                                                    <span className="text-xs text-primary/50 bg-primary/10 px-2 py-1 rounded">
                                                        Receipt
                                                    </span>
                                                )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <button className="text-primary hover:text-primary/75 text-sm font-medium">
                                            View
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="p-4 border-t border-primary/10">
                <TablePagination
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredTransactions.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default TransactionsTable;
