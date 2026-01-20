import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import Input from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CurrencyInput } from '@/pages/protected/CreateJournalEntrypage';
import { AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { useTaxes } from '../../services/apis/taxApi';
import {
    useSplitTransaction,
    type SplitTransactionItem,
} from '../../services/apis/transactions';
import { showErrorToast } from '../../utills/toast';

interface SplitTransactionDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId: string;
    transactionAmount: number; // The total amount to split
    transactionCategoryId?: string; // Category/Account ID from the transaction
    transactionTaxId?: string; // Tax ID from the transaction
    transactionDescription?: string; // Description from the transaction
    onSuccess?: () => void;
}

export function SplitTransactionDrawer({
    open,
    onOpenChange,
    transactionId,
    transactionAmount,
    transactionCategoryId,
    transactionTaxId,
    transactionDescription,
    onSuccess,
}: SplitTransactionDrawerProps) {
    const { mutate: splitTransaction, isPending } = useSplitTransaction();
    const { data: accountsData } = useChartOfAccounts({
        isActive: true,
        limit: 200,
    });
    const { data: taxesData } = useTaxes({ isActive: true, limit: 100 });

    const accounts = useMemo(
        () => accountsData?.data?.items || [],
        [accountsData]
    );

    // Filter to expense and income accounts for splitting
    const splitAccounts = useMemo(() => {
        return accounts.filter(
            (account) =>
                (account.accountType === 'expense' ||
                    account.accountType === 'income') &&
                account.isActive
        );
    }, [accounts]);

    const accountOptions: ComboboxOption[] = useMemo(() => {
        return splitAccounts.map((account) => ({
            value: account.id,
            label: `${account.accountNumber || ''} - ${account.accountName}`.trim(),
        }));
    }, [splitAccounts]);

    const taxOptions: ComboboxOption[] = useMemo(() => {
        const taxes = taxesData?.data?.items || [];
        return taxes.map((tax) => ({
            value: tax.id,
            label: `${tax.name} (${(tax.rate * 100).toFixed(2)}%)`,
        }));
    }, [taxesData]);

    // Find categoryId from category name if category is provided as a string
    const resolvedCategoryId = useMemo(() => {
        if (!transactionCategoryId) return '';

        // If it's already an ID (UUID format), use it directly
        if (
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                transactionCategoryId
            )
        ) {
            return transactionCategoryId;
        }

        // Otherwise, try to find matching account by name
        const matchingAccount = splitAccounts.find(
            (account) =>
                account.accountName.toLowerCase() ===
                    transactionCategoryId.toLowerCase() ||
                `${account.accountNumber || ''} - ${account.accountName}`
                    .toLowerCase()
                    .includes(transactionCategoryId.toLowerCase())
        );

        return matchingAccount?.id || '';
    }, [transactionCategoryId, splitAccounts]);

    const [splits, setSplits] = useState<
        Array<SplitTransactionItem & { id: string }>
    >([
        {
            id: '1',
            amount: 0,
            categoryId: '',
            description: '',
            taxIds: [],
        },
    ]);

    // Reset splits when modal opens/closes
    useEffect(() => {
        if (open) {
            // Initialize with one split pre-filled with the full amount and transaction data
            setSplits([
                {
                    id: '1',
                    amount: transactionAmount,
                    categoryId: resolvedCategoryId,
                    description: transactionDescription || '',
                    taxIds: transactionTaxId ? [transactionTaxId] : [],
                },
            ]);
        } else {
            // Reset when closing
            setSplits([
                {
                    id: '1',
                    amount: 0,
                    categoryId: '',
                    description: '',
                    taxIds: [],
                },
            ]);
        }
    }, [
        open,
        transactionAmount,
        resolvedCategoryId,
        transactionTaxId,
        transactionDescription,
    ]);

    // Reset splits when modal closes
    const handleClose = (open: boolean) => {
        onOpenChange(open);
    };

    // Calculate total of all splits
    const totalSplit = useMemo(() => {
        return splits.reduce((sum, split) => sum + (split.amount || 0), 0);
    }, [splits]);

    // Calculate remaining amount
    const remaining = transactionAmount - totalSplit;

    // Check if splits are valid - Only amount is required, others are pre-filled
    const isValid = useMemo(() => {
        if (splits.length === 0) return false;
        // All splits must have amount > 0 (category and description are pre-filled)
        const allValid = splits.every(
            (split) =>
                split.amount > 0 &&
                split.categoryId && // Should be pre-filled, but check anyway
                (split.description.trim().length > 0 || transactionDescription) // Use transaction description if split description is empty
        );
        // Total must not exceed transaction amount
        const totalNotExceeded = totalSplit <= transactionAmount + 0.01; // Allow small floating point differences
        // Total must equal transaction amount (within tolerance)
        const totalValid = Math.abs(totalSplit - transactionAmount) < 0.01;
        return allValid && totalNotExceeded && totalValid;
    }, [splits, totalSplit, transactionAmount, transactionDescription]);

    const addSplit = () => {
        // Calculate remaining amount to pre-fill
        const otherSplitsTotal = splits.reduce(
            (sum, s) => sum + (s.amount || 0),
            0
        );
        const remainingAmount = Math.max(
            0,
            transactionAmount - otherSplitsTotal
        );

        setSplits([
            ...splits,
            {
                id: Date.now().toString(),
                amount: remainingAmount, // Pre-fill with remaining amount
                categoryId: resolvedCategoryId, // Pre-fill with transaction category
                description: transactionDescription || '', // Pre-fill with transaction description
                taxIds: transactionTaxId ? [transactionTaxId] : [], // Pre-fill with transaction tax
            },
        ]);
    };

    const removeSplit = (id: string) => {
        if (splits.length > 1) {
            setSplits(splits.filter((split) => split.id !== id));
        }
    };

    const updateSplit = (
        id: string,
        updates: Partial<SplitTransactionItem>
    ) => {
        // Simple update without automatic amount synchronization
        setSplits(
            splits.map((split) =>
                split.id === id ? { ...split, ...updates } : split
            )
        );
    };

    // Auto-fill remaining amount to a specific split
    const fillRemainingAmount = (splitId: string) => {
        const otherSplitsTotal = splits
            .filter((s) => s.id !== splitId)
            .reduce((sum, s) => sum + (s.amount || 0), 0);
        const remaining = transactionAmount - otherSplitsTotal;
        if (remaining > 0) {
            updateSplit(splitId, { amount: remaining });
        }
    };

    const handleSubmit = () => {
        if (!isValid) {
            showErrorToast(
                'Please ensure all splits are valid and the total matches the transaction amount'
            );
            return;
        }

        const payload = {
            splits: splits.map((split) => {
                // Remove the internal 'id' field and format according to API spec
                // Use transaction description as fallback if split description is empty
                const splitItem: {
                    amount: number;
                    categoryId: string;
                    description: string;
                    taxIds: string[];
                } = {
                    amount: split.amount,
                    categoryId: split.categoryId,
                    description:
                        split.description.trim() ||
                        transactionDescription ||
                        '',
                    taxIds:
                        split.taxIds && split.taxIds.length > 0
                            ? split.taxIds
                            : [],
                };
                return splitItem;
            }),
        };

        // Log payload for debugging
        console.log(
            'Split Transaction Payload:',
            JSON.stringify(payload, null, 2)
        );

        splitTransaction(
            { id: transactionId, payload },
            {
                onSuccess: (response) => {
                    console.log('Split Transaction Response:', response);
                    setSplits([
                        {
                            id: '1',
                            amount: 0,
                            categoryId: '',
                            description: '',
                            taxIds: [],
                        },
                    ]);
                    onSuccess?.();
                    onOpenChange(false);
                },
                onError: (error) => {
                    console.error('Split Transaction Error:', error);
                },
            }
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const allocationPercentage = (totalSplit / transactionAmount) * 100;
    const isFullyAllocated = Math.abs(remaining) < 0.01;
    const hasOverAllocation = remaining < 0;

    return (
        <Drawer direction="bottom" open={open} onOpenChange={handleClose}>
            <DrawerContent className="max-h-[90vh] flex flex-col">
                <DrawerHeader className="border-b border-primary/10 pb-3 px-3 sm:px-6">
                    <DrawerTitle className="text-base sm:text-lg">
                        Split Transaction
                    </DrawerTitle>
                    <DrawerDescription className="text-xs sm:text-sm">
                        Total: {formatCurrency(transactionAmount)} • Split into
                        multiple categories
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-4 p-3 sm:p-4 flex-1 overflow-y-auto">
                    {/* Mobile-Friendly Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-card rounded-lg border border-primary/10">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <div>
                                <span className="text-xs text-primary/60">
                                    Total Amount
                                </span>
                                <p className="text-base sm:text-lg font-semibold text-primary">
                                    {formatCurrency(transactionAmount)}
                                </p>
                            </div>
                            <div className="hidden sm:block h-8 w-px bg-primary/20" />
                            <div>
                                <span className="text-xs text-primary/60">
                                    Allocated
                                </span>
                                <p
                                    className={`text-base sm:text-lg font-semibold ${
                                        isFullyAllocated
                                            ? 'text-green-600'
                                            : hasOverAllocation
                                              ? 'text-red-600'
                                              : 'text-orange-600'
                                    }`}
                                >
                                    {formatCurrency(totalSplit)}
                                </p>
                            </div>
                            {Math.abs(remaining) >= 0.01 && (
                                <>
                                    <div className="hidden sm:block h-8 w-px bg-primary/20" />
                                    <div>
                                        <span className="text-xs text-primary/60">
                                            Remaining
                                        </span>
                                        <p
                                            className={`text-sm font-semibold ${
                                                remaining > 0
                                                    ? 'text-orange-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {remaining > 0 ? '+' : ''}
                                            {formatCurrency(remaining)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isFullyAllocated ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-xs sm:text-sm font-medium text-green-600">
                                        Complete
                                    </span>
                                </>
                            ) : hasOverAllocation ? (
                                <>
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-xs sm:text-sm font-medium text-red-600">
                                        Over allocated
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs sm:text-sm text-primary/70">
                                    {allocationPercentage.toFixed(0)}% allocated
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Desktop Table Layout with Mobile Transpose */}
                    <div className="border border-primary/10 rounded-lg overflow-hidden">
                        <Table
                            borderStyle="default"
                            className="w-full"
                            transposeOnMobile
                        >
                            <TableHeader sticky>
                                <tr>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead className="min-w-[200px]">
                                        Category
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">
                                        Description
                                    </TableHead>
                                    <TableHead align="right" className="w-40">
                                        Amount
                                    </TableHead>
                                    <TableHead className="w-40">Tax</TableHead>
                                    <TableHead className="w-20"></TableHead>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {splits.map((split, index) => {
                                    return (
                                        <TableRow key={split.id}>
                                            <TableCell
                                                className="text-primary/60 font-medium"
                                                data-label="#"
                                            >
                                                {index + 1}
                                            </TableCell>
                                            <TableCell
                                                noTruncate
                                                data-label="Category"
                                            >
                                                <Combobox
                                                    options={accountOptions}
                                                    value={split.categoryId}
                                                    onChange={(value) => {
                                                        updateSplit(split.id, {
                                                            categoryId:
                                                                value || '',
                                                        });
                                                    }}
                                                    placeholder="Select category..."
                                                    searchPlaceholder="Search account..."
                                                    className="h-10 text-sm"
                                                />
                                            </TableCell>
                                            <TableCell
                                                noTruncate
                                                data-label="Description"
                                            >
                                                <Input
                                                    value={split.description}
                                                    onChange={(e) => {
                                                        updateSplit(split.id, {
                                                            description:
                                                                e.target.value,
                                                        });
                                                    }}
                                                    placeholder="Enter description..."
                                                    className="h-10 text-sm"
                                                />
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                noTruncate
                                                data-label="Amount"
                                            >
                                                <div className="flex items-center gap-2 justify-end md:justify-end">
                                                    <CurrencyInput
                                                        value={
                                                            split.amount > 0
                                                                ? String(
                                                                      split.amount
                                                                  )
                                                                : ''
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            const numValue =
                                                                parseFloat(
                                                                    value
                                                                ) || 0;
                                                            updateSplit(
                                                                split.id,
                                                                {
                                                                    amount: numValue,
                                                                }
                                                            );
                                                        }}
                                                        className="h-10 w-full md:w-auto text-right text-sm"
                                                        placeholder="0.00"
                                                    />
                                                    {remaining > 0.01 &&
                                                        index ===
                                                            splits.length -
                                                                1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    fillRemainingAmount(
                                                                        split.id
                                                                    )
                                                                }
                                                                className="h-8 px-2 text-xs hidden md:inline-flex"
                                                                title={`Fill remaining ${formatCurrency(remaining)}`}
                                                            >
                                                                Fill
                                                            </Button>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                noTruncate
                                                data-label="Tax"
                                            >
                                                <Combobox
                                                    options={taxOptions}
                                                    value={
                                                        split.taxIds &&
                                                        split.taxIds.length > 0
                                                            ? split.taxIds[0]
                                                            : ''
                                                    }
                                                    onChange={(value) => {
                                                        updateSplit(split.id, {
                                                            taxIds: value
                                                                ? [value]
                                                                : [],
                                                        });
                                                    }}
                                                    placeholder="Select tax..."
                                                    searchPlaceholder="Search tax..."
                                                    className="h-10 text-sm"
                                                />
                                            </TableCell>
                                            <TableCell data-label="">
                                                {splits.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeSplit(
                                                                split.id
                                                            )
                                                        }
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Add Split Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={addSplit}
                        startIcon={<Plus />}
                        className="w-full h-11 sm:h-10"
                    >
                        Add Split
                    </Button>
                </div>

                <DrawerFooter className="border-t border-primary/10 px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                            {isFullyAllocated ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600 font-medium">
                                        Ready to split
                                    </span>
                                </>
                            ) : hasOverAllocation ? (
                                <>
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-red-600 font-medium">
                                        Amount exceeds total
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                    <span className="text-orange-600 font-medium">
                                        {formatCurrency(remaining)} remaining
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                                className="flex-1 sm:flex-initial h-11 sm:h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!isValid || isPending}
                                className="flex-1 sm:flex-initial h-11 sm:h-9"
                            >
                                {isPending
                                    ? 'Splitting...'
                                    : 'Split Transaction'}
                            </Button>
                        </div>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
