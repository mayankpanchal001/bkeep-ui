import { cn } from '../../../../utils/cn';
import { Checkbox } from '../../../ui/checkbox';
import { ParsedTransaction } from '../types';

interface TransactionPreviewTableProps {
    transactions: ParsedTransaction[];
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    className?: string;
}

export function TransactionPreviewTable({
    transactions,
    selectedIds,
    onToggleSelection,
    onSelectAll,
    onDeselectAll,
    className,
}: TransactionPreviewTableProps) {
    const isAllSelected =
        transactions.length > 0 && selectedIds.size === transactions.length;
    const isIndeterminate =
        selectedIds.size > 0 && selectedIds.size < transactions.length;

    const handleSelectAllChange = () => {
        if (isAllSelected || isIndeterminate) {
            onDeselectAll();
        } else {
            onSelectAll();
        }
    };

    const formatAmount = (amount: number) => {
        const formatted = Math.abs(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return amount < 0 ? `-$${formatted}` : `$${formatted}`;
    };

    return (
        <div
            className={cn(
                'border border-border rounded-lg overflow-hidden',
                className
            )}
        >
            {/* Summary bar */}
            <div className="bg-muted/50 px-4 py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                    {selectedIds.size} of {transactions.length} transactions
                    selected
                </span>
            </div>

            {/* Table */}
            <div className="max-h-[400px] overflow-auto">
                <table className="w-full">
                    <thead className="bg-muted/30 sticky top-0">
                        <tr className="border-b border-border">
                            <th className="w-12 px-4 py-3 text-left">
                                <Checkbox
                                    checked={isAllSelected}
                                    data-state={
                                        isIndeterminate
                                            ? 'indeterminate'
                                            : undefined
                                    }
                                    onCheckedChange={handleSelectAllChange}
                                    aria-label="Select all"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Description
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions.map((tx) => {
                            const isSelected = selectedIds.has(tx.id);
                            return (
                                <tr
                                    key={tx.id}
                                    className={cn(
                                        'transition-colors hover:bg-muted/30',
                                        isSelected && 'bg-accent/20'
                                    )}
                                >
                                    <td className="w-12 px-4 py-3">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                onToggleSelection(tx.id)
                                            }
                                            aria-label={`Select transaction ${tx.description}`}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                                        {tx.date || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground max-w-[300px] truncate">
                                        {tx.description || '-'}
                                    </td>
                                    <td
                                        className={cn(
                                            'px-4 py-3 text-sm text-right whitespace-nowrap font-medium',
                                            tx.amount < 0
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                        )}
                                    >
                                        {formatAmount(tx.amount)}
                                    </td>
                                </tr>
                            );
                        })}

                        {transactions.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-muted-foreground"
                                >
                                    No transactions to preview
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
