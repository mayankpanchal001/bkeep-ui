import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/table';
import { usePostTransaction } from '@/services/apis/transactions';
import { showSuccessToast } from '@/utills/toast';
import { BankTransaction, currency } from '@/utils/transactionUtils';
import { MoreVertical } from 'lucide-react';
import React from 'react';

interface TransactionsTableProps {
    data: BankTransaction[];
    selectedItems: (string | number)[];
    setSelectedItems: (items: (string | number)[]) => void;
    sort: string | null;
    order: 'asc' | 'desc' | null;
    onSortChange: (key: string | null, direction?: 'asc' | 'desc') => void;

    isBulkProcessing: boolean;
    handleBulkPost: () => void;
    handleBulkAction: (
        actionName: string,
        actionFn: (id: string) => Promise<unknown>
    ) => void;
    reconcileTransactionAsync: (id: string) => Promise<unknown>;
    reverseTransactionAsync: (id: string) => Promise<unknown>;
    voidTransactionAsync: (id: string) => Promise<unknown>;

    supplierOptions: ComboboxOption[];
    categoryOptions: ComboboxOption[];
    taxOptions: ComboboxOption[];
    taxRateById: Record<string, number>;
    contactNameById: Map<string, string>;

    updateTransaction: (vars: {
        id: string;
        payload: Record<string, unknown>;
    }) => void;
    setTransactions: React.Dispatch<React.SetStateAction<BankTransaction[]>>;

    onSplitClick: (tx: BankTransaction) => void;
    onCreateRuleClick: (tx: BankTransaction) => void;

    reconcileTransaction: (id: string) => void;
    voidTransaction: (id: string) => void;
    reverseTransaction: (id: string) => void;

    pagination: {
        page: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        onPageChange: (page: number) => void;
    };
}

export const TransactionsTable = ({
    data,
    selectedItems,
    setSelectedItems,
    sort,
    order,
    onSortChange,
    isBulkProcessing,
    handleBulkPost,
    handleBulkAction,
    reconcileTransactionAsync,
    reverseTransactionAsync,
    voidTransactionAsync,
    supplierOptions,
    categoryOptions,
    taxOptions,
    taxRateById,
    contactNameById,
    updateTransaction,
    setTransactions,
    onSplitClick,
    onCreateRuleClick,
    voidTransaction,
    reverseTransaction,
    pagination,
}: TransactionsTableProps) => {
    const { mutate: postTransaction } = usePostTransaction();

    return (
        <div className="flex flex-col flex-1 min-h-0">
            <Table
                containerClassName="h-full"
                enableSelection={true}
                onSelectionChange={setSelectedItems}
                rowIds={data.map((t) => t.id)}
                selectedIds={selectedItems}
                sortKey={sort}
                sortDirection={order}
                onSortChange={(key, direction) => {
                    onSortChange(
                        direction ? key : null,
                        direction || undefined
                    );
                }}
            >
                {/* Bulk Actions Toolbar */}
                <TableSelectionToolbar>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            onClick={handleBulkPost}
                        >
                            Post ({selectedItems.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            onClick={() =>
                                handleBulkAction(
                                    'reconciled',
                                    reconcileTransactionAsync
                                )
                            }
                        >
                            Reconcile ({selectedItems.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            onClick={() =>
                                handleBulkAction(
                                    'reversed',
                                    reverseTransactionAsync
                                )
                            }
                        >
                            Reverse ({selectedItems.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            onClick={() =>
                                handleBulkAction('voided', voidTransactionAsync)
                            }
                        >
                            Void ({selectedItems.length})
                        </Button>
                    </div>
                </TableSelectionToolbar>

                <TableHeader sticky>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="date">
                            Date
                        </TableHead>
                        <TableHead>Bank Description</TableHead>
                        <TableHead sortable sortKey="spent">
                            Spent
                        </TableHead>
                        <TableHead sortable sortKey="received">
                            Received
                        </TableHead>
                        <TableHead sortable sortKey="tax">
                            Tax
                        </TableHead>
                        <TableHead>From/To</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-[1%] whitespace-nowrap">
                            Action
                        </TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableEmptyState
                            colSpan={9}
                            message="No transactions found"
                            description="Try adjusting your filters or add new transactions."
                        />
                    ) : (
                        data.map((t) => (
                            <TableRow key={t.id} rowId={t.id}>
                                <TableCell data-label="">
                                    <TableRowCheckbox rowId={t.id} />
                                </TableCell>
                                <TableCell data-label="Date">
                                    <span className="text-xs font-medium text-primary">
                                        {new Date(t.date).toLocaleDateString()}
                                    </span>
                                </TableCell>
                                <TableCell
                                    data-label="Bank Description"
                                    noTruncate
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs w-max font-medium text-primary">
                                            {t.description}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell data-label="Spent">
                                    <span className="text-red-600 font-semibold">
                                        {t.spent ? `-${currency(t.spent)}` : ''}
                                    </span>
                                </TableCell>
                                <TableCell data-label="Received">
                                    <span className="text-green-600 font-semibold">
                                        {t.received
                                            ? `+${currency(t.received)}`
                                            : ''}
                                    </span>
                                </TableCell>
                                <TableCell data-label="Tax" noTruncate>
                                    <div className="flex items-center gap-3">
                                        <div className="min-w-[200px]">
                                            <Combobox
                                                options={taxOptions}
                                                value={t.taxId || ''}
                                                onChange={(value) => {
                                                    const rate =
                                                        (value &&
                                                            taxRateById[
                                                            value
                                                            ]) ||
                                                        0;
                                                    setTransactions((prev) =>
                                                        prev.map((tx) => {
                                                            if (tx.id !== t.id)
                                                                return tx;
                                                            const base =
                                                                tx.spent ?? 0;
                                                            const taxAmount =
                                                                Number(
                                                                    (
                                                                        base *
                                                                        rate
                                                                    ).toFixed(2)
                                                                );
                                                            return {
                                                                ...tx,
                                                                taxId:
                                                                    value ||
                                                                    undefined,
                                                                taxRate:
                                                                    rate ||
                                                                    undefined,
                                                                tax: taxAmount,
                                                            };
                                                        })
                                                    );
                                                    updateTransaction({
                                                        id: t.id,
                                                        payload: {
                                                            taxIds: value
                                                                ? [value]
                                                                : [],
                                                        },
                                                    });
                                                }}
                                                placeholder="Select tax..."
                                                searchPlaceholder="Search tax..."
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell data-label="From/To" noTruncate>
                                    <div className="min-w-[200px]">
                                        <Combobox
                                            options={supplierOptions}
                                            value={t.fromTo || ''}
                                            onChange={(value) => {
                                                // Find contactId by displayName
                                                const contactId =
                                                    Array.from(
                                                        contactNameById.entries()
                                                    ).find(
                                                        ([, name]) =>
                                                            name === value
                                                    )?.[0] || undefined;

                                                setTransactions((prev) =>
                                                    prev.map((tx) =>
                                                        tx.id === t.id
                                                            ? {
                                                                ...tx,
                                                                fromTo:
                                                                    value ||
                                                                    undefined,
                                                                contactId:
                                                                    contactId ||
                                                                    undefined,
                                                            }
                                                            : tx
                                                    )
                                                );
                                                // Persist change to backend
                                                if (contactId) {
                                                    updateTransaction({
                                                        id: t.id,
                                                        payload: {
                                                            contactId,
                                                        },
                                                    });
                                                }
                                            }}
                                            placeholder="Select supplier..."
                                            searchPlaceholder="Search supplier..."
                                            className="h-8"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell
                                    data-label="Match/Categorize"
                                    noTruncate
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="min-w-[220px]">
                                            <Combobox
                                                options={categoryOptions}
                                                value={t.category || ''}
                                                onChange={(value) => {
                                                    // Find category name by ID
                                                    const categoryName =
                                                        categoryOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                value
                                                        )?.label || value;

                                                    setTransactions((prev) =>
                                                        prev.map((tx) =>
                                                            tx.id === t.id
                                                                ? {
                                                                    ...tx,
                                                                    category:
                                                                        value ||
                                                                        undefined,
                                                                }
                                                                : tx
                                                        )
                                                    );
                                                    if (value) {
                                                        showSuccessToast(
                                                            `Category set to ${categoryName}`
                                                        );
                                                        // Persist change to backend
                                                        updateTransaction({
                                                            id: t.id,
                                                            payload: {
                                                                categoryId:
                                                                    value,
                                                            },
                                                        });
                                                    }
                                                }}
                                                placeholder="Select category..."
                                                searchPlaceholder="Search category..."
                                                className="h-8"
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setTransactions((prev) =>
                                                    prev.map((tx) =>
                                                        tx.id === t.id
                                                            ? {
                                                                ...tx,
                                                                matched:
                                                                    !tx.matched,
                                                            }
                                                            : tx
                                                    )
                                                );
                                                showSuccessToast(
                                                    t.matched
                                                        ? 'Transaction unmarked as matched'
                                                        : 'Transaction matched'
                                                );
                                            }}
                                            variant={
                                                t.matched
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {t.matched ? 'Match' : 'Match'}
                                        </Button>
                                    </div>
                                </TableCell>

                                <TableCell data-label="Action">
                                    <div className="flex items-center gap-2">
                                        {t.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                className="min-w-[1rem]"
                                                onClick={() => {
                                                    console.log(
                                                        `[AUDIT] Action: Post, Transaction: ${t.id}, Status: ${t.status}, Time: ${new Date().toISOString()}`
                                                    );
                                                    postTransaction(t.id);
                                                }}
                                            >
                                                Post
                                            </Button>
                                        )}
                                        {t.status === 'voided' && (
                                            <Button
                                                size="sm"
                                                className="min-w-[1rem]"
                                                onClick={() => {
                                                    console.log(
                                                        `[AUDIT] Action: Undo Exclude, Transaction: ${t.id}, Status: ${t.status}, Time: ${new Date().toISOString()}`
                                                    );
                                                    updateTransaction({
                                                        id: t.id,
                                                        payload: {
                                                            status: 'draft',
                                                        },
                                                    });
                                                }}
                                            >
                                                Undo
                                            </Button>
                                        )}
                                        {['pending', 'posted'].includes(
                                            t.status
                                        ) && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="min-w-[1rem]"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {t.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        console.log(
                                                                            `[AUDIT] Action: Exclude, Transaction: ${t.id}, Status: ${t.status}, Time: ${new Date().toISOString()}`
                                                                        );
                                                                        voidTransaction(
                                                                            t.id
                                                                        );
                                                                    }}
                                                                >
                                                                    Exclude
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        console.log(
                                                                            `[AUDIT] Action: Split, Transaction: ${t.id}, Status: ${t.status}, Time: ${new Date().toISOString()}`
                                                                        );
                                                                        onSplitClick(
                                                                            t
                                                                        );
                                                                    }}
                                                                >
                                                                    Split
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        console.log(
                                                                            `[AUDIT] Action: Create Rule, Transaction: ${t.id}, Status: ${t.status}, Time: ${new Date().toISOString()}`
                                                                        );
                                                                        onCreateRuleClick(
                                                                            t
                                                                        );
                                                                    }}
                                                                >
                                                                    Create Rule
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {t.status === 'posted' && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    console.log(
                                                                        `[AUDIT] Action: Reverse, Transaction: ${t.id}, Status: ${t.status}, Time: ${new Date().toISOString()}`
                                                                    );
                                                                    reverseTransaction(
                                                                        t.id
                                                                    );
                                                                }}
                                                            >
                                                                Reverse
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {/* Pagination outside scrollable area */}

            <TablePagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.onPageChange}
            />
        </div>
    );
};
