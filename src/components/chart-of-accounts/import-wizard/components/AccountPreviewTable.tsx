import { cn } from '@/utils/cn';
import { Checkbox } from '../../../ui/checkbox';
import { ImportField, ParsedAccount } from '../types';

interface AccountPreviewTableProps {
    accounts: ParsedAccount[];
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    importFields: ImportField[];
    mappedFields?: Record<string, string>;
    className?: string;
    readOnly?: boolean;
}

export function AccountPreviewTable({
    accounts,
    selectedIds,
    onToggleSelection,
    onSelectAll,
    onDeselectAll,
    importFields,
    mappedFields,
    className,
    readOnly = false,
}: AccountPreviewTableProps) {
    const isAllSelected =
        accounts.length > 0 && selectedIds.size === accounts.length;
    const isIndeterminate =
        selectedIds.size > 0 && selectedIds.size < accounts.length;

    const handleSelectAllChange = () => {
        if (readOnly) return;
        if (isAllSelected || isIndeterminate) {
            onDeselectAll();
        } else {
            onSelectAll();
        }
    };

    // Determine which columns to show
    // If mappedFields is provided, filter by it. Otherwise show all importFields (for template preview where mapping is implicit/all)
    const columnsToShow = mappedFields
        ? importFields.filter((field) => mappedFields[field.key])
        : importFields;

    return (
        <div
            className={cn(
                'border border-border rounded-lg overflow-hidden',
                className
            )}
        >
            {/* Summary bar */}
            {!readOnly && (
                <div className="bg-muted/50 px-4 py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">
                        {selectedIds.size} of {accounts.length} accounts
                        selected
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="max-h-[400px] overflow-auto">
                <table className="w-full">
                    <thead className="bg-muted/30 sticky top-0">
                        <tr className="border-b border-border">
                            {!readOnly && (
                                <th className="w-12 px-4 py-3 text-left">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAllChange}
                                        aria-label="Select all"
                                    />
                                </th>
                            )}
                            {columnsToShow.map((field) => (
                                <th
                                    key={field.key}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                                >
                                    {field.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {accounts.map((account) => {
                            const isSelected = selectedIds.has(account.id);
                            return (
                                <tr
                                    key={account.id}
                                    className={cn(
                                        'transition-colors hover:bg-muted/30',
                                        isSelected &&
                                            !readOnly &&
                                            'bg-accent/20'
                                    )}
                                >
                                    {!readOnly && (
                                        <td className="w-12 px-4 py-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() =>
                                                    onToggleSelection(
                                                        account.id
                                                    )
                                                }
                                                aria-label={`Select account`}
                                            />
                                        </td>
                                    )}
                                    {columnsToShow.map((field) => (
                                        <td
                                            key={field.key}
                                            className="px-4 py-3 text-sm text-foreground whitespace-nowrap max-w-[200px] truncate"
                                        >
                                            {String(account[field.key] || '-')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}

                        {accounts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={
                                        columnsToShow.length +
                                        (readOnly ? 0 : 1)
                                    }
                                    className="px-4 py-8 text-center text-muted-foreground"
                                >
                                    No accounts to preview
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
