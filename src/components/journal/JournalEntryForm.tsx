import { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import type { CreateJournalEntryPayload, JournalEntryLine } from '../../types/journal';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';

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
    const [journalNo, setJournalNo] = useState(initialData?.journalNo || '');
    const [journalDate, setJournalDate] = useState(
        initialData?.journalDate || new Date().toISOString().split('T')[0]
    );
    const [isAdjusting, setIsAdjusting] = useState(
        initialData?.isAdjusting || false
    );
    const [lines, setLines] = useState<JournalEntryLine[]>(
        initialData?.lines || [
            { accountId: '', debit: 0, credit: 0, description: '', name: '', salesTax: 0 },
            { accountId: '', debit: 0, credit: 0, description: '', name: '', salesTax: 0 },
        ]
    );
    const [memo, setMemo] = useState(initialData?.memo || '');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isRecurring, setIsRecurring] = useState(
        initialData?.isRecurring || false
    );
    const [recurringFrequency, setRecurringFrequency] = useState<
        'daily' | 'weekly' | 'monthly' | 'yearly' | undefined
    >(initialData?.recurringFrequency);

    const calculateTotals = () => {
        const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
        return { totalDebit, totalCredit };
    };

    const { totalDebit, totalCredit } = calculateTotals();
    const isBalanced = totalDebit === totalCredit;

    const handleAddLine = () => {
        setLines([
            ...lines,
            { accountId: '', debit: 0, credit: 0, description: '', name: '', salesTax: 0 },
        ]);
    };

    const handleRemoveLine = (index: number) => {
        if (lines.length > 2) {
            setLines(lines.filter((_, i) => i !== index));
        }
    };

    const handleLineChange = (
        index: number,
        field: keyof JournalEntryLine,
        value: string | number
    ) => {
        const updatedLines = [...lines];
        updatedLines[index] = {
            ...updatedLines[index],
            [field]: value,
        };
        setLines(updatedLines);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isBalanced) {
            alert('Debits and Credits must balance!');
            return;
        }

        const payload: CreateJournalEntryPayload = {
            journalNo,
            journalDate,
            isAdjusting,
            lines: lines.map(line => ({
                accountId: line.accountId,
                debit: Number(line.debit),
                credit: Number(line.credit),
                description: line.description,
                name: line.name,
                salesTax: Number(line.salesTax) || 0,
            })),
            memo,
            attachments: attachments.length > 0 ? attachments : undefined,
            isRecurring,
            recurringFrequency,
        };

        onSubmit(payload);
    };

    const handleClearAll = () => {
        setLines([
            { accountId: '', debit: 0, credit: 0, description: '', name: '', salesTax: 0 },
            { accountId: '', debit: 0, credit: 0, description: '', name: '', salesTax: 0 },
        ]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InputField
                    label="Journal date"
                    type="date"
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    required
                />

                <InputField
                    label="Journal no."
                    type="text"
                    value={journalNo}
                    onChange={(e) => setJournalNo(e.target.value)}
                    placeholder="Auto-generated if empty"
                />

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isAdjusting"
                        checked={isAdjusting}
                        onChange={(e) => setIsAdjusting(e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="isAdjusting" className="text-sm font-medium text-primary">
                        Is Adjusting Journal Entry?
                    </label>
                </div>
            </div>

            {/* Journal Lines Table */}
            <div className="overflow-x-auto border border-primary-10 rounded-lg">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">
                                #
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">
                                ACCOUNT
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">
                                DEBITS
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">
                                CREDITS
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">
                                DESCRIPTION
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">
                                NAME
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">
                                SALES TAX
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-primary-75 uppercase tracking-wider">

                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {lines.map((line, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-2 py-2 text-sm text-primary">
                                    {index + 1}
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        value={line.accountId}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'accountId',
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                                        placeholder="Account ID"
                                        required
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={line.debit}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'debit',
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={line.credit}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'credit',
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="px-2 py-2">
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
                                        className="w-full px-2 py-1 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                                        placeholder="Description"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="text"
                                        value={line.name || ''}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'name',
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                                        placeholder="Name"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={line.salesTax || 0}
                                        onChange={(e) =>
                                            handleLineChange(
                                                index,
                                                'salesTax',
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="w-full px-2 py-1 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    {lines.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLine(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={2} className="px-2 py-2 text-right font-semibold text-sm text-primary">
                                Total
                            </td>
                            <td className="px-2 py-2 font-semibold text-sm text-primary">
                                ${totalDebit.toFixed(2)}
                            </td>
                            <td className="px-2 py-2 font-semibold text-sm text-primary">
                                ${totalCredit.toFixed(2)}
                            </td>
                            <td colSpan={4}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {!isBalanced && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-xs text-red-800 font-medium">
                        ⚠️ Debits and Credits must balance! Difference: $
                        {Math.abs(totalDebit - totalCredit).toFixed(2)}
                    </p>
                </div>
            )}

            {/* Action Buttons for Lines */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddLine}
                >
                    <FaPlus className="w-4 h-4" />
                    Add lines
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearAll}
                >
                    Clear all lines
                </Button>
            </div>

            {/* Memo and Attachments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                        Memo
                    </label>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        rows={3}
                        className="w-full px-2 py-1.5 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        placeholder="Add notes about this journal entry..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                        Attachments
                    </label>
                    <div className="border-2 border-dashed border-primary-10 rounded-lg p-4 text-center">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-primary hover:text-primary-75"
                        >
                            <p className="text-sm">Add attachment</p>
                            <p className="text-xs text-primary-50 mt-1">
                                Max file size: 20 MB
                            </p>
                        </label>
                        {attachments.length > 0 && (
                            <div className="mt-3 text-xs text-primary-75">
                                {attachments.length} file(s) selected
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recurring Options */}
            <div className="border border-primary-10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="checkbox"
                        id="isRecurring"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-primary">
                        Make recurring
                    </label>
                </div>

                {isRecurring && (
                    <div className="ml-6">
                        <label className="block text-sm font-medium text-primary mb-1">
                            Frequency
                        </label>
                        <select
                            value={recurringFrequency || ''}
                            onChange={(e) =>
                                setRecurringFrequency(
                                    e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                                )
                            }
                            className="px-2 py-1.5 text-sm border border-primary-10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Select frequency</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-primary-10">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>

                <div className="flex gap-2">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading || !isBalanced}
                        loading={isLoading}
                    >
                        Save
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading || !isBalanced}
                        loading={isLoading}
                    >
                        Save and new
                    </Button>
                </div>
            </div>
        </form>
    );
}

