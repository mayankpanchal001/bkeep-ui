import { useState } from 'react';
import { FaArrowDown, FaArrowUp, FaFilter, FaSearch } from 'react-icons/fa';
import { DataTable, Column } from '../shared/DataTable';
import { useTransactions } from '../../services/apis/transactions';
import { TransactionType2 } from '../../types';

const TransactionsTable = () => {
    const { data, isLoading, isError, error } = useTransactions();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const filteredTransactions = data?.filter((transaction) => {
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

    const totalPages = Math.ceil((filteredTransactions?.length || 0) / itemsPerPage);
    const paginatedTransactions = filteredTransactions?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ) || [];

    const pagination = {
        page: currentPage,
        totalPages: totalPages,
        totalItems: filteredTransactions?.length || 0,
        onPageChange: setCurrentPage,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
    };

    const columns: Column<TransactionType2>[] = [
        {
            header: 'Date',
            accessorKey: 'latestPostedDate',
            cell: (transaction) => {
                const date = new Date(
                    transaction.latestPostedDate || transaction.createdAt
                ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
                const amount = parseFloat(transaction.totalAmount || '0');
                const isCredit = amount >= 0;
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                isCredit ? 'bg-green-500' : 'bg-red-500'
                            }`}
                        ></div>
                        <span className="text-sm font-medium text-primary">
                            {date}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Description',
            cell: (transaction) => {
                const firstSplit = transaction.splits?.[0];
                const description =
                    firstSplit?.senderDescription ||
                    firstSplit?.recipientDescription ||
                    transaction.itemType ||
                    'N/A';
                const displayLabel = firstSplit?.categoryAndGifi?.[0]?.displayLabel;
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-primary">
                            {description}
                        </span>
                        {displayLabel && (
                            <span className="text-xs text-primary-50">
                                {displayLabel}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Type',
            accessorKey: 'itemType',
            cell: (transaction) => (
                <span className="text-xs text-primary-50 bg-primary-10 px-2 py-1 rounded">
                    {transaction.itemType || 'N/A'}
                </span>
            )
        },
        {
            header: 'Amount',
            cell: (transaction) => {
                const amount = parseFloat(transaction.totalAmount || '0');
                const isCredit = amount >= 0;
                const formattedAmount = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: transaction.currency?.toUpperCase() || 'USD',
                }).format(Math.abs(amount));

                return (
                    <div
                        className={`flex items-center gap-1 font-semibold ${
                            isCredit ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {isCredit ? (
                            <FaArrowUp className="w-3 h-3" />
                        ) : (
                            <FaArrowDown className="w-3 h-3" />
                        )}
                        <span>
                            {isCredit ? '+' : '-'}
                            {formattedAmount}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Balance',
            cell: (transaction) => (
                <span className="text-sm text-primary-75">
                    {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: transaction.currency?.toUpperCase() || 'USD',
                    }).format(0)}
                </span>
            )
        },
        {
            header: 'Tags',
            cell: (transaction) => {
                const firstSplit = transaction.splits?.[0];
                return (
                    <div className="flex items-center gap-2">
                        {transaction.pending && (
                            <span className="text-xs text-primary-50 bg-primary-10 px-2 py-1 rounded">
                                Pending
                            </span>
                        )}
                        {firstSplit?.pendingTransfer && (
                            <span className="text-xs text-primary-50 bg-primary-10 px-2 py-1 rounded">
                                Transfer
                            </span>
                        )}
                        {transaction.matchedReceiptDocs &&
                            transaction.matchedReceiptDocs.length > 0 && (
                                <span className="text-xs text-primary-50 bg-primary-10 px-2 py-1 rounded">
                                    Receipt
                                </span>
                            )}
                    </div>
                );
            }
        },
        {
            header: 'Action',
            cell: () => (
                <button className="text-primary hover:text-primary-75 text-sm font-medium">
                    View
                </button>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="bg-white rounded-2 shadow-sm border border-primary-10 p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-25 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-primary-50">
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

    return (
        <div className="bg-white max-h-[calc(100vh-100px)] rounded-2 shadow-sm border border-primary-10 overflow-y-auto">
            {/* Table Header with Search */}
            <div className="p-4 border-b border-primary-10 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-50 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-primary-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-25 focus:border-primary text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-primary-10 rounded-lg hover:bg-primary-10 transition-colors text-sm font-medium text-primary">
                        <FaFilter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <DataTable
                data={paginatedTransactions}
                columns={columns}
                pagination={pagination}
                emptyMessage={
                    searchTerm
                        ? 'No transactions found matching your search'
                        : 'No transactions available'
                }
            />
        </div>
    );
};

export default TransactionsTable;
