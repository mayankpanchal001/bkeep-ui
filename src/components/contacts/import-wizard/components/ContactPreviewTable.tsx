
import { cn } from '../../../../utils/cn';
import { Checkbox } from '../../../ui/checkbox';
import { ImportField, ParsedContact } from '../types';

interface ContactPreviewTableProps {
    contacts: ParsedContact[];
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    importFields: ImportField[];
    mappedFields: Record<string, string>;
    className?: string;
}

export function ContactPreviewTable({
    contacts,
    selectedIds,
    onToggleSelection,
    onSelectAll,
    onDeselectAll,
    importFields,
    mappedFields,
    className,
}: ContactPreviewTableProps) {
    const isAllSelected =
        contacts.length > 0 && selectedIds.size === contacts.length;
    const isIndeterminate =
        selectedIds.size > 0 && selectedIds.size < contacts.length;

    const handleSelectAllChange = () => {
        if (isAllSelected || isIndeterminate) {
            onDeselectAll();
        } else {
            onSelectAll();
        }
    };

    // Determine which columns to show (only mapped ones)
    const columnsToShow = importFields.filter((field) => mappedFields[field.key]);

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
                    {selectedIds.size} of {contacts.length} contacts selected
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
                        {contacts.map((contact) => {
                            const isSelected = selectedIds.has(contact.id);
                            return (
                                <tr
                                    key={contact.id}
                                    className={cn(
                                        'transition-colors hover:bg-muted/30',
                                        isSelected && 'bg-accent/20'
                                    )}
                                >
                                    <td className="w-12 px-4 py-3">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                onToggleSelection(contact.id)
                                            }
                                            aria-label={`Select contact`}
                                        />
                                    </td>
                                    {columnsToShow.map((field) => (
                                        <td
                                            key={field.key}
                                            className="px-4 py-3 text-sm text-foreground whitespace-nowrap max-w-[200px] truncate"
                                        >
                                            {String(contact[field.key] || '-')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}

                        {contacts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columnsToShow.length + 1}
                                    className="px-4 py-8 text-center text-muted-foreground"
                                >
                                    No contacts to preview
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
