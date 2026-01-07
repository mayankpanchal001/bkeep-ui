import Button from '@/components/typography/Button';
import { InputField } from '@/components/typography/InputFields';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { useContacts } from '@/services/apis/contactsApi';
import { useTaxes } from '@/services/apis/taxApi';
import type { CreateJournalEntryPayload } from '@/types/journal';
import { useMemo, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

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
    type DraftLine = {
        id: string | undefined;
        lineNumber: number;
        accountId: string;
        description: string;
        debit: string;
        credit: string;
        contactId: string | undefined;
        taxId: string | undefined;
    };

    const toNumber = (v: unknown) => {
        if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
        if (typeof v === 'string') {
            const n = Number(v);
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };

    const normalizeDate = (value: string | undefined) => {
        if (!value) return new Date().toISOString().split('T')[0];
        return value.includes('T') ? value.split('T')[0] : value;
    };

    const emptyLine = (lineNumber: number): DraftLine => ({
        id: undefined,
        lineNumber,
        accountId: '',
        description: '',
        debit: '',
        credit: '',
        contactId: undefined,
        taxId: undefined,
    });

    const { data: accountsData } = useChartOfAccounts({ page: 1, limit: 200 });
    const accounts = useMemo(
        () => accountsData?.data?.items || [],
        [accountsData]
    );

    const { data: taxesData } = useTaxes({
        page: 1,
        limit: 200,
        isActive: true,
        sort: 'name',
        order: 'asc',
    });
    const taxes = taxesData?.data?.items || [];

    const { data: contactsData } = useContacts({
        page: 1,
        limit: 200,
        isActive: true,
        sort: 'displayName',
        order: 'asc',
    });
    const contacts = useMemo(
        () => contactsData?.data?.items || [],
        [contactsData]
    );

    const accountOptions = useMemo(() => {
        return accounts.map((account) => ({
            value: account.id,
            label: `${account.accountNumber} - ${account.accountName}`,
        }));
    }, [accounts]);

    const contactOptions = useMemo(() => {
        return contacts.map((contact) => ({
            value: contact.id,
            label: contact.displayName,
        }));
    }, [contacts]);

    const [entryNumber, setEntryNumber] = useState(
        initialData?.entryNumber || ''
    );
    const [entryDate, setEntryDate] = useState(
        normalizeDate(initialData?.entryDate)
    );
    const [isAdjusting, setIsAdjusting] = useState(
        Boolean(initialData?.isAdjusting)
    );
    const [memo, setMemo] = useState(initialData?.memo || '');

    const [lines, setLines] = useState<DraftLine[]>(() => {
        const fromInitial =
            initialData?.lines?.map((l) => ({
                id: typeof l.id === 'string' ? l.id : undefined,
                lineNumber: typeof l.lineNumber === 'number' ? l.lineNumber : 0,
                accountId: l.accountId || '',
                description: l.description || '',
                debit: (() => {
                    const n = toNumber(l.debit);
                    return n !== 0 ? String(n) : '';
                })(),
                credit: (() => {
                    const n = toNumber(l.credit);
                    return n !== 0 ? String(n) : '';
                })(),
                contactId: l.contactId || undefined,
                taxId: l.taxId || undefined,
            })) || [];

        const base = fromInitial.length > 0 ? fromInitial : [];
        const minLines = 6;
        const next = [...base];
        const withLineNumbers = next.map((l, i) => ({
            ...l,
            lineNumber: i + 1,
        }));
        while (withLineNumbers.length < minLines)
            withLineNumbers.push(emptyLine(withLineNumbers.length + 1));
        return withLineNumbers;
    });

    const [formError, setFormError] = useState<string | null>(null);
    const [lineErrors, setLineErrors] = useState<
        { accountId?: string; amount?: string }[]
    >([]);

    // pure helper – keep outside useMemo to avoid dep issues
    const parseAmount = (v: string) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : 0;
    };

    const totals = useMemo(() => {
        const parseAmount = (value: string) => {
            return toNumber(value);
        };
        const totalDebit = lines.reduce(
            (sum, l) => sum + parseAmount(l.debit),
            0
        );
        const totalCredit = lines.reduce(
            (sum, l) => sum + parseAmount(l.credit),
            0
        );
        return { totalDebit, totalCredit };
    }, [lines]);

    const isBalanced = Math.abs(totals.totalDebit - totals.totalCredit) < 0.01;

    const updateLine = (
        index: number,
        patch: Partial<Omit<DraftLine, 'id'>>
    ) => {
        setLines((prev) =>
            prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
        );
        setFormError(null);
        setLineErrors((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            next[index] = {};
            return next;
        });
    };

    const handleAddLine = () => {
        setLines((prev) => [...prev, emptyLine(prev.length + 1)]);
    };

    const handleRemoveLine = (index: number) => {
        setLines((prev) => {
            const next = prev.filter((_, i) => i !== index);
            if (next.length < 2) return prev;
            return next.map((l, i) => ({ ...l, lineNumber: i + 1 }));
        });
        setLineErrors((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const errors: Array<{ accountId?: string; amount?: string }> = [];

        const filled = lines.filter((l) => {
            const hasAmount =
                Boolean(l.debit.trim()) || Boolean(l.credit.trim());
            return (
                Boolean(l.accountId) ||
                hasAmount ||
                Boolean(l.description.trim()) ||
                Boolean(l.contactId) ||
                Boolean(l.taxId)
            );
        });

        for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            const isFilled = filled.includes(l);
            if (!isFilled) {
                errors[i] = {};
                continue;
            }

            const debit = parseAmount(l.debit);
            const credit = parseAmount(l.credit);
            const rowErr: { accountId?: string; amount?: string } = {};

            if (!l.accountId) rowErr.accountId = 'Account is required';

            const hasDebit = debit > 0;
            const hasCredit = credit > 0;

            if (!hasDebit && !hasCredit)
                rowErr.amount = 'Debit or credit is required';
            if (hasDebit && hasCredit)
                rowErr.amount = 'Only one of debit or credit';

            errors[i] = rowErr;
        }

        const validLines = filled.filter((l) => l.accountId);
        if (validLines.length < 2) {
            setFormError('Add at least two lines with accounts.');
            setLineErrors(errors);
            return false;
        }

        if (!isBalanced) {
            setFormError('Debits and credits must balance.');
            setLineErrors(errors);
            return false;
        }

        const hasAnyRowError = errors.some((e) => e.accountId || e.amount);
        if (hasAnyRowError) {
            setFormError('Fix highlighted lines.');
            setLineErrors(errors);
            return false;
        }

        setLineErrors([]);
        setFormError(null);
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const filled = lines.filter((l) => {
            const hasAmount =
                Boolean(l.debit.trim()) || Boolean(l.credit.trim());
            return (
                Boolean(l.accountId) ||
                hasAmount ||
                Boolean(l.description.trim()) ||
                Boolean(l.contactId) ||
                Boolean(l.taxId)
            );
        });

        const payload: CreateJournalEntryPayload = {
            entryNumber: entryNumber.trim() || undefined,
            entryDate,
            entryType: isAdjusting ? 'adjusting' : 'standard',
            isAdjusting,
            memo: memo.trim() || undefined,
            description: memo.trim() || undefined,
            lines: filled.map((l, idx) => ({
                id: l.id,
                accountId: l.accountId,
                lineNumber: idx + 1,
                debit: parseAmount(l.debit),
                credit: parseAmount(l.credit),
                description: l.description.trim(),
                contactId: l.contactId || undefined,
                taxId: l.taxId || undefined,
            })),
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                    label="Entry date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                />
                <InputField
                    label="Entry number"
                    type="text"
                    value={entryNumber}
                    onChange={(e) => setEntryNumber(e.target.value)}
                    placeholder="Optional"
                />
                <div className="flex items-end">
                    <label className="flex items-center gap-3 text-sm text-primary/70 select-none">
                        <input
                            type="checkbox"
                            checked={isAdjusting}
                            onChange={(e) => setIsAdjusting(e.target.checked)}
                            className="h-4 w-4 rounded border-primary/20 text-primary"
                        />
                        Adjusting entry
                    </label>
                </div>
            </div>

            {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                </div>
            )}

            <Table borderStyle="default" className="w-full">
                <TableHeader sticky>
                    <tr>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="min-w-[260px]">Account</TableHead>
                        <TableHead className="min-w-[260px]">
                            Description
                        </TableHead>
                        <TableHead className="w-56">Contact</TableHead>
                        <TableHead align="right" className="w-36">
                            Debit
                        </TableHead>
                        <TableHead align="right" className="w-36">
                            Credit
                        </TableHead>
                        <TableHead className="w-56">Tax</TableHead>
                        <TableHead className="w-20"></TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {lines.map((line, index) => {
                        const rowError = lineErrors[index] || {};
                        return (
                            <TableRow key={index}>
                                <TableCell className="text-primary/60 font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell noTruncate>
                                    <div
                                        className={`input-wrap ${rowError.accountId ? '!border-red-500' : ''}`}
                                    >
                                        <select
                                            value={line.accountId}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    accountId: e.target.value,
                                                })
                                            }
                                            className="input"
                                        >
                                            <option value="">
                                                Select account
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
                                    </div>
                                </TableCell>
                                <TableCell noTruncate>
                                    <div className="input-wrap">
                                        <input
                                            value={line.description}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    description: e.target.value,
                                                })
                                            }
                                            className="input"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell noTruncate>
                                    <div className="input-wrap">
                                        <select
                                            value={line.contactId || ''}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    contactId:
                                                        e.target.value ||
                                                        undefined,
                                                })
                                            }
                                            className="input"
                                        >
                                            <option value="">No contact</option>
                                            {contactOptions.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </TableCell>
                                <TableCell align="right" noTruncate>
                                    <div
                                        className={`input-wrap ${rowError.amount ? '!border-red-500' : ''}`}
                                    >
                                        <input
                                            type="number"
                                            value={line.debit}
                                            onChange={(e) => {
                                                const next = e.target.value;
                                                updateLine(index, {
                                                    debit: next,
                                                    credit: next
                                                        ? ''
                                                        : line.credit,
                                                });
                                            }}
                                            className="input text-right"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell align="right" noTruncate>
                                    <div
                                        className={`input-wrap ${rowError.amount ? '!border-red-500' : ''}`}
                                    >
                                        <input
                                            type="number"
                                            value={line.credit}
                                            onChange={(e) => {
                                                const next = e.target.value;
                                                updateLine(index, {
                                                    credit: next,
                                                    debit: next
                                                        ? ''
                                                        : line.debit,
                                                });
                                            }}
                                            className="input text-right"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell noTruncate>
                                    <div className="input-wrap">
                                        <select
                                            value={line.taxId || ''}
                                            onChange={(e) =>
                                                updateLine(index, {
                                                    taxId:
                                                        e.target.value ||
                                                        undefined,
                                                })
                                            }
                                            className="input"
                                        >
                                            <option value="">No tax</option>
                                            {taxes.map((tax) => (
                                                <option
                                                    key={tax.id}
                                                    value={tax.id}
                                                >
                                                    {tax.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </TableCell>
                                <TableCell noTruncate>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLine(index)}
                                        disabled={
                                            isLoading || lines.length <= 2
                                        }
                                        className="p-2 text-primary/40 hover:text-red-600 disabled:opacity-40 disabled:hover:text-primary/40"
                                        title="Remove line"
                                    >
                                        <FaTrash className="h-4 w-4" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between gap-3 flex-wrap">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<FaPlus className="w-3.5 h-3.5" />}
                    onClick={handleAddLine}
                    disabled={isLoading}
                >
                    Add line
                </Button>

                <div className="flex items-center gap-4 text-sm">
                    <span className="text-primary/70">
                        Debit:{' '}
                        <span className="text-primary font-semibold">
                            ${totals.totalDebit.toFixed(2)}
                        </span>
                    </span>
                    <span className="text-primary/70">
                        Credit:{' '}
                        <span className="text-primary font-semibold">
                            ${totals.totalCredit.toFixed(2)}
                        </span>
                    </span>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isBalanced
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {isBalanced ? 'Balanced' : 'Not balanced'}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="input-label">Memo</label>
                <div className="input-wrap">
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="input min-h-[120px] resize-y py-2"
                        placeholder="Optional"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isLoading}
                >
                    Save
                </Button>
            </div>
        </form>
    );
}
