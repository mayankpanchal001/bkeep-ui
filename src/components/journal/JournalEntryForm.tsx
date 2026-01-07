import { useMemo, useState } from 'react';
import {
    FaGripVertical,
    FaPlus,
    FaRegCopy,
    FaTimes,
    FaTrash,
} from 'react-icons/fa';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { useTaxes } from '../../services/apis/taxApi';
import type {
    CreateJournalEntryLine,
    CreateJournalEntryPayload,
} from '../../types/journal';
import { cn } from '../../utils/cn';
import { InputField } from '../typography/InputFields';

// Mock Contacts for the "Name" dropdown
const MOCK_CONTACTS = [
    { id: '1', name: 'Testing', type: 'Customer' },
    { id: '2', name: 'RBC', type: 'Supplier' },
    { id: '3', name: 'Vaibhav Inc.', type: 'Supplier' },
    { id: '4', name: 'WagePoint', type: 'Supplier' },
];

type JournalEntryFormProps = {
    initialData?: Partial<CreateJournalEntryPayload>;
    onSubmit: (data: CreateJournalEntryPayload) => void;
    onCancel: () => void;
    isLoading?: boolean;
};

export function JournalEntryForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: JournalEntryFormProps) {
    // Fetch chart of accounts
    const { data: accountsData } = useChartOfAccounts();
    const accounts = useMemo(() => {
        return accountsData?.data?.items || [];
    }, [accountsData]);

    // Fetch taxes
    const { data: taxesData } = useTaxes({
        page: 1,
        limit: 100,
        isActive: true,
        sort: 'name',
        order: 'asc',
    });
    const taxes = useMemo(() => {
        return taxesData?.data?.items || [];
    }, [taxesData]);

    // Account options for dropdown
    const accountOptions = useMemo(() => {
        return accounts.map((account) => ({
            value: account.id,
            label: `${account.accountNumber} - ${account.accountName}`,
        }));
    }, [accounts]);

    const [entryNumber, setEntryNumber] = useState(
        initialData?.entryNumber || ''
    );
    const [entryDate, setEntryDate] = useState(
        initialData?.entryDate || new Date().toISOString().split('T')[0]
    );
    const [isAdjusting, setIsAdjusting] = useState(
        initialData?.isAdjusting || false
    );
    const [memo, setMemo] = useState(initialData?.memo || '');
    const [lines, setLines] = useState<CreateJournalEntryLine[]>(
        initialData?.lines ||
            Array(8)
                .fill(null)
                .map((_, i) => ({
                    accountId: '',
                    lineNumber: i + 1,
                    debit: 0,
                    credit: 0,
                    description: '',
                    memo: '',
                    contactId: '',
                    taxId: '',
                    id: 0,
                    accountName: '',
                    name: '',
                }))
    );

    // Drag and Drop State
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Row selection state for showing input boxes
    const [focusedLineIndex, setFocusedLineIndex] = useState<number | null>(
        null
    );

    const getInputClassName = (index: number, additionalClasses?: string) => {
        const isSelected = focusedLineIndex === index;
        return cn(
            'w-full px-3 py-2 rounded transition-colors h-10 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary',
            isSelected
                ? 'bg-card border border-border hover:border-primary/50'
                : 'bg-transparent border border-transparent',
            additionalClasses
        );
    };

    const calculateTotals = () => {
        const totalDebit = lines.reduce(
            (sum, line) => sum + (Number(line.debit) || 0),
            0
        );
        const totalCredit = lines.reduce(
            (sum, line) => sum + (Number(line.credit) || 0),
            0
        );
        return { totalDebit, totalCredit };
    };

    const { totalDebit, totalCredit } = calculateTotals();
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const handleAddLine = () => {
        setLines([
            ...lines,
            {
                accountId: '',
                lineNumber: lines.length + 1,
                debit: 0,
                credit: 0,
                description: '',
                memo: '',
                contactId: '',
                taxId: '',
                id: 0,
                accountName: '',
                name: '',
            },
        ]);
    };

    const handleRemoveLine = (index: number) => {
        const updatedLines = lines.filter((_, i) => i !== index);
        // Ensure at least 2 lines or empty lines to match UI preference
        // But for flexible UI, maybe we don't force it, but let's keep at least 2 for journal entry logic
        if (updatedLines.length < 2) {
            updatedLines.push({
                accountId: '',
                lineNumber: updatedLines.length + 1,
                debit: 0,
                credit: 0,
                description: '',
                memo: '',
                contactId: '',
                taxId: '',
                id: 0,
                accountName: '',
                name: '',
            });
        }
        // Re-index
        const reindexed = updatedLines.map((line, idx) => ({
            ...line,
            lineNumber: idx + 1,
        }));
        setLines(reindexed);
    };

    const handleClearAll = () => {
        setLines(
            Array(8)
                .fill(null)
                .map((_, i) => ({
                    accountId: '',
                    lineNumber: i + 1,
                    debit: 0,
                    credit: 0,
                    description: '',
                    memo: '',
                    contactId: '',
                    taxId: '',
                    id: 0,
                    accountName: '',
                    name: '',
                }))
        );
    };

    const handleLineChange = (
        index: number,
        field: keyof CreateJournalEntryLine,
        value: string | number
    ) => {
        const updatedLines = [...lines];
        updatedLines[index] = {
            ...updatedLines[index],
            [field]: value,
        };
        setLines(updatedLines);
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set drag image
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const updatedLines = [...lines];
        const [movedItem] = updatedLines.splice(draggedIndex, 1);
        updatedLines.splice(dropIndex, 0, movedItem);

        // Re-index line numbers
        const reindexed = updatedLines.map((line, idx) => ({
            ...line,
            lineNumber: idx + 1,
        }));

        setLines(reindexed);
        setDraggedIndex(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty lines (no account selected)
        const validLines = lines.filter((line) => line.accountId);

        if (validLines.length < 2) {
            alert('Please add at least two lines with accounts.');
            return;
        }

        if (!isBalanced) {
            alert('Debits and Credits must balance!');
            return;
        }

        const payload: CreateJournalEntryPayload = {
            entryNumber: entryNumber || undefined,
            entryDate,
            entryType: isAdjusting ? 'adjusting' : 'standard',
            isAdjusting,
            description: memo || undefined,
            memo: memo || undefined,
            currency: 'USD',
            exchangeRate: 1.0,
            lines: validLines.map((line, index) => ({
                accountId: line.accountId,
                lineNumber: index + 1,
                debit: Number(line.debit),
                credit: Number(line.credit),
                description: line.description,
                memo: line.memo || '',
                contactId: line.contactId,
                taxId: line.taxId,
            })),
        };

        onSubmit(payload);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full bg-background min-h-screen"
        >
            {/* Top Bar - mimicking the image header */}
            <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                        <span className="text-xl font-bold text-muted-foreground">
                            ↺
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-primary">
                        {entryNumber
                            ? `Journal Entry no.${entryNumber}`
                            : 'Journal Entry'}
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <button
                        type="button"
                        className="flex items-center gap-2 hover:text-primary font-medium"
                    >
                        <FaRegCopy className="text-lg" /> <span>Copy</span>
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="hover:text-primary"
                    >
                        <FaTimes className="text-2xl" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header Fields */}
                <div className="flex flex-wrap items-start gap-12">
                    <div className="w-48">
                        <InputField
                            label="Journal date"
                            type="date"
                            value={entryDate}
                            onChange={(e) => setEntryDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="w-80">
                        <InputField
                            label="Journal no."
                            type="text"
                            value={entryNumber}
                            onChange={(e) => setEntryNumber(e.target.value)}
                            placeholder={initialData?.entryNumber || '2'}
                        />
                    </div>
                    <div className="flex items-center gap-3 pt-9">
                        <input
                            type="checkbox"
                            id="isAdjusting"
                            checked={isAdjusting}
                            onChange={(e) => setIsAdjusting(e.target.checked)}
                            className="w-5 h-5 text-primary border-border rounded focus:ring-primary"
                        />
                        <label
                            htmlFor="isAdjusting"
                            className="text-muted-foreground font-medium"
                        >
                            Is Adjusting Journal Entry?
                        </label>
                    </div>
                </div>

                {/* Grid Table */}
                <div className="bg-card rounded shadow-sm border border-border overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-bold text-muted-foreground uppercase bg-card border-b border-border">
                            <tr>
                                <th className="w-10 px-2 py-3"></th>
                                <th className="px-2 py-3 w-10">#</th>
                                <th className="px-2 py-3 min-w-[200px]">
                                    ACCOUNT
                                </th>
                                <th className="px-2 py-3 w-32">DEBITS</th>
                                <th className="px-2 py-3 w-32">CREDITS</th>
                                <th className="px-2 py-3">DESCRIPTION</th>
                                <th className="px-2 py-3 w-48">NAME</th>
                                <th className="px-2 py-3 w-32">SALES TAX</th>
                                <th className="w-16 px-2 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {lines.map((line, index) => (
                                <tr
                                    key={index}
                                    draggable
                                    onDragStart={(e) =>
                                        handleDragStart(e, index)
                                    }
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onClick={() => setFocusedLineIndex(index)}
                                    className={cn(
                                        'group hover:bg-muted/50 transition-colors',
                                        draggedIndex === index &&
                                            'opacity-50 bg-muted',
                                        focusedLineIndex === index &&
                                            'bg-muted/30'
                                    )}
                                >
                                    <td className="px-2 py-2 cursor-grab text-muted/50 hover:text-muted-foreground text-center align-top pt-4">
                                        <FaGripVertical className="mx-auto" />
                                    </td>
                                    <td className="px-2 py-2 text-muted-foreground align-top pt-4 font-medium">
                                        {index + 1}
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <select
                                            value={line.accountId}
                                            onChange={(e) =>
                                                handleLineChange(
                                                    index,
                                                    'accountId',
                                                    e.target.value
                                                )
                                            }
                                            onFocus={() =>
                                                setFocusedLineIndex(index)
                                            }
                                            className={getInputClassName(index)}
                                        >
                                            <option value="">
                                                Select Account
                                            </option>
                                            {accountOptions.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <input
                                            type="number"
                                            value={line.debit || ''}
                                            onChange={(e) =>
                                                handleLineChange(
                                                    index,
                                                    'debit',
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0
                                                )
                                            }
                                            onFocus={() =>
                                                setFocusedLineIndex(index)
                                            }
                                            className={getInputClassName(
                                                index,
                                                'text-right'
                                            )}
                                            placeholder=""
                                        />
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <input
                                            type="number"
                                            value={line.credit || ''}
                                            onChange={(e) =>
                                                handleLineChange(
                                                    index,
                                                    'credit',
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0
                                                )
                                            }
                                            onFocus={() =>
                                                setFocusedLineIndex(index)
                                            }
                                            className={getInputClassName(
                                                index,
                                                'text-right'
                                            )}
                                            placeholder=""
                                        />
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <input
                                            type="text"
                                            value={line.description}
                                            onChange={(e) =>
                                                handleLineChange(
                                                    index,
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                            onFocus={() =>
                                                setFocusedLineIndex(index)
                                            }
                                            className={getInputClassName(index)}
                                        />
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <select
                                            value={line.contactId || ''}
                                            onChange={(e) =>
                                                handleLineChange(
                                                    index,
                                                    'contactId',
                                                    e.target.value
                                                )
                                            }
                                            onFocus={() =>
                                                setFocusedLineIndex(index)
                                            }
                                            className={getInputClassName(index)}
                                        >
                                            <option value="">
                                                Select Name
                                            </option>
                                            <option
                                                value="new"
                                                className="text-accent font-semibold"
                                            >
                                                + Add new
                                            </option>
                                            {MOCK_CONTACTS.map((contact) => (
                                                <option
                                                    key={contact.id}
                                                    value={contact.id}
                                                >
                                                    {contact.name} (
                                                    {contact.type})
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-2 py-2 align-top">
                                        <select
                                            value={line.taxId || ''}
                                            onChange={(e) =>
                                                handleLineChange(
                                                    index,
                                                    'taxId',
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-2 bg-card border border-border rounded hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors h-10"
                                        >
                                            <option value="">Select Tax</option>
                                            {taxes.map((tax) => (
                                                <option
                                                    key={tax.id}
                                                    value={tax.id}
                                                >
                                                    {tax.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-2 py-2 text-center align-top pt-3">
                                        <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                className="text-muted-foreground/70 hover:text-primary"
                                            >
                                                <FaRegCopy size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveLine(index)
                                                }
                                                className="text-muted-foreground/70 hover:text-primary"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-muted font-bold text-primary">
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-4 py-4 text-right"
                                >
                                    Total
                                </td>
                                <td className="px-4 py-4 text-right">
                                    ${totalDebit.toFixed(2)}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    ${totalCredit.toFixed(2)}
                                </td>
                                <td colSpan={4}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleAddLine}
                        className="px-4 py-2 text-sm font-bold text-primary bg-card border border-border rounded shadow-sm hover:bg-muted transition-colors"
                    >
                        Add lines
                    </button>
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="px-4 py-2 text-sm font-bold text-primary bg-card border border-border rounded shadow-sm hover:bg-muted transition-colors"
                    >
                        Clear all lines
                    </button>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            Memo
                        </label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="w-full h-32 px-4 py-3 text-sm border border-border rounded hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-colors"
                            placeholder="Enter a note about this journal entry"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            Attachments
                        </label>
                        <div className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-border rounded bg-card hover:bg-muted transition-colors cursor-pointer">
                            <div className="text-center">
                                <p className="text-sm font-bold text-primary mb-1">
                                    Add attachment
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Max file size: 20 MB
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action Bar */}
            <div className="px-6 py-4 bg-card border-t border-border flex items-center justify-between sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 text-sm font-bold text-primary border border-border rounded hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="px-6 py-2 text-sm font-bold text-primary border border-border rounded hover:bg-muted transition-colors"
                    >
                        Clear
                    </button>
                </div>

                <div className="text-sm font-bold text-primary hover:text-accent cursor-pointer">
                    Make recurring
                </div>

                <div className="flex gap-0 relative group">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2 text-sm font-bold text-white bg-primary border border-primary rounded-l hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        className="px-3 py-2 text-white bg-primary border-l border-primary/80 border-y border-r border-primary rounded-r hover:bg-primary/90 focus:outline-none transition-colors"
                    >
                        <FaPlus className="w-3 h-3 text-white" />
                    </button>
                    <div className="absolute right-0 bottom-full mb-1 w-48 bg-card border border-border rounded shadow-lg hidden group-hover:block z-20">
                        <div className="py-1">
                            <button
                                type="button"
                                className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-muted font-medium"
                            >
                                Save and new
                            </button>
                            <button
                                type="button"
                                className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-muted font-medium"
                            >
                                Save and close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
