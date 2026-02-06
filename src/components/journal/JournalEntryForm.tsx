import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CurrencyInput } from '@/pages/protected/CreateJournalEntrypage';
import { uploadAttachment } from '@/services/apis/attachmentApi';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { useContacts } from '@/services/apis/contactsApi';
import { useTaxes } from '@/services/apis/taxApi';
import type { Attachment, CreateJournalEntryPayload } from '@/types/journal';
import { FileText, GripVertical, Save, Upload, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { FaPlus, FaTrash, FaCopy } from 'react-icons/fa';

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
        const sorted = [...accounts].sort((a, b) => {
            const numA = parseInt(a.accountNumber || '0', 10);
            const numB = parseInt(b.accountNumber || '0', 10);
            return numA - numB;
        });

        return sorted.map((account) => ({
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

    const [attachments, setAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<
        Attachment[]
    >(initialData?.existingAttachments || []);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [draggedLineIndex, setDraggedLineIndex] = useState<number | null>(
        null
    );
    const [dragOverLineIndex, setDragOverLineIndex] = useState<number | null>(
        null
    );

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setAttachments((prev) => [
                ...prev,
                ...Array.from(e.dataTransfer.files),
            ]);
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments(
            attachments.filter((_, index) => index !== indexToRemove)
        );
    };

    const removeExistingAttachment = (indexToRemove: number) => {
        setExistingAttachments((prev) =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    };

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

    const handleDuplicateLine = (index: number) => {
        setLines((prev) => {
            const newLine = [...prev];
            const lineToCopy = newLine[index];

            const duplicateLine:DraftLine = {
                ...lineToCopy,
                id: undefined,
            };
            newLine.splice(index + 1, 0, duplicateLine);
            return newLine.map((l, i) => ({...l, lineNumber: i+1,}));
        });

        setLineErrors((prev) => {
            if (prev.length === 0) return prev;
            const newErrors = [...prev];
            newErrors.splice(index + 1, 0,{});
            return newErrors;
        });
    }

    const handleRemoveLine = (index: number) => {
        setLines((prev) => {
            const next = prev.filter((_, i) => i !== index);
            if (next.length < 2) return prev;
            return next.map((l, i) => ({ ...l, lineNumber: i + 1 }));
        });
        setLineErrors((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRowDragStart = (e: React.DragEvent, index: number) => {
        setDraggedLineIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Create a drag image
        const row = e.currentTarget as HTMLElement;
        const dragImage = row.cloneNode(true) as HTMLElement;
        dragImage.style.opacity = '0.5';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
    };

    const handleRowDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedLineIndex === null || draggedLineIndex === index) return;
        setDragOverLineIndex(index);
    };

    const handleRowDragEnd = () => {
        setDraggedLineIndex(null);
        setDragOverLineIndex(null);
    };

    const handleRowDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedLineIndex === null || draggedLineIndex === dropIndex) {
            handleRowDragEnd();
            return;
        }

        const newLines = [...lines];
        const [draggedItem] = newLines.splice(draggedLineIndex, 1);
        newLines.splice(dropIndex, 0, draggedItem);

        // Recalculate line numbers
        const reorderedLines = newLines.map((line, idx) => ({
            ...line,
            lineNumber: idx + 1,
        }));

        setLines(reorderedLines);

        // We also need to reorder the errors to permit the user to keep tracking them
        setLineErrors((prev) => {
            if (prev.length === 0) return prev;
            const newErrors = [...prev];
            const [draggedError] = newErrors.splice(draggedLineIndex, 1);
            newErrors.splice(dropIndex, 0, draggedError);
            return newErrors;
        });

        handleRowDragEnd();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        let uploadedIds: string[] = [];
        if (attachments.length > 0) {
            try {
                const uploadPromises = attachments.map((file) =>
                    uploadAttachment(file, {
                        tag: 'journal_entry',
                        description: file.name,
                    })
                );

                const responses = await Promise.all(uploadPromises);
                uploadedIds = responses.map((res) => res.data.id);
            } catch (error) {
                console.error('Failed to upload attachments', error);
                // You might want to show an error toast here and abort
                return;
            }
        }

        const existingIds = existingAttachments.map((a) => a.id);
        const finalAttachmentIds = [...existingIds, ...uploadedIds];

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
            attachmentIds:
                finalAttachmentIds.length > 0 ? finalAttachmentIds : undefined,
        };

        onSubmit(payload);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments([...attachments, ...Array.from(e.target.files)]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    type="date"
                    value={entryDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEntryDate(e.target.value)
                    }
                    required
                />
                <Input
                    type="text"
                    value={entryNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEntryNumber(e.target.value)
                    }
                    placeholder="Optional"
                />
                <div className="flex items-center">
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
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="min-w-[260px]">Account</TableHead>
                        <TableHead align="right" className="w-44">
                            Debit
                        </TableHead>
                        <TableHead align="right" className="w-44">
                            Credit
                        </TableHead>
                        <TableHead className="min-w-[260px]">
                            Description
                        </TableHead>
                        <TableHead className="w-56">Contact</TableHead>

                        <TableHead className="w-56">Tax</TableHead>
                        <TableHead className="w-20"></TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {lines.map((line, index) => {
                        const rowError = lineErrors[index] || {};
                        return (
                            <TableRow
                                key={index}
                                draggable
                                onDragStart={(e) =>
                                    handleRowDragStart(e, index)
                                }
                                onDragOver={(e) => handleRowDragOver(e, index)}
                                onDragEnd={handleRowDragEnd}
                                onDrop={(e) => handleRowDrop(e, index)}
                                className={`transition-colors ${
                                    draggedLineIndex === index
                                        ? 'opacity-50 bg-muted/50'
                                        : ''
                                } ${
                                    dragOverLineIndex === index
                                        ? 'border-t-2 border-primary'
                                        : ''
                                }`}
                            >
                                <TableCell className="text-primary/60 font-medium text-center">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="text-center p-0">
                                    <div className="flex items-center justify-center cursor-grab hover:text-primary text-muted-foreground">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                </TableCell>
                                <TableCell noTruncate>
                                    <Select
                                        value={line.accountId || undefined}
                                        onValueChange={(v) =>
                                            updateLine(index, {
                                                accountId: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            aria-invalid={!!rowError.accountId}
                                            size="sm"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accountOptions.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell align="right">
                                    <CurrencyInput
                                        className="text-right"
                                        value={line.debit}
                                        onValueChange={(val) => {
                                            updateLine(index, {
                                                debit: val,
                                                credit: val ? '' : line.credit,
                                            });
                                        }}
                                        placeholder="$0.00"
                                    />
                                </TableCell>
                                <TableCell align="right" noTruncate>
                                    <CurrencyInput
                                        className="text-right"
                                        value={line.credit}
                                        onValueChange={(val) => {
                                            updateLine(index, {
                                                credit: val,
                                                debit: val ? '' : line.debit,
                                            });
                                        }}
                                        placeholder="$0.00"
                                    />
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
                                    <Select
                                        value={line.contactId || undefined}
                                        onValueChange={(v) =>
                                            updateLine(index, {
                                                contactId:
                                                    v === 'none'
                                                        ? undefined
                                                        : v,
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            size="sm"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="No contact" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                No contact
                                            </SelectItem>
                                            {contactOptions.map((opt) => (
                                                <SelectItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell noTruncate>
                                    <Select
                                        value={line.taxId || undefined}
                                        onValueChange={(v) =>
                                            updateLine(index, {
                                                taxId:
                                                    v === 'none'
                                                        ? undefined
                                                        : v,
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            size="sm"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="No tax" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                No tax
                                            </SelectItem>
                                            {taxes.map((tax) => (
                                                <SelectItem
                                                    key={tax.id}
                                                    value={tax.id}
                                                >
                                                    {tax.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell noTruncate>
                                    <div className='flex items-center gap-1'>
                                        <button
                                        type ="button"
                                        onClick={() => handleDuplicateLine(index)}
                                        disabled={isLoading}
                                        className="p-2 text-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:text-primary/40"
                                        title="Duplicate line"
                                        >
                                            <FaCopy className="w-4 h-4" />

                                        </button>
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
                    startIcon={<FaPlus className="w-3.5 h-3.5" />}
                    onClick={handleAddLine}
                    disabled={isLoading}
                >
                    Add line
                </Button>

                <div className="flex items-center gap-4 text-sm">
                    <span className="text-primary/70">
                        Debit:{' '}
                        <span className="text-primary font-semibold">
                            {totals.totalDebit.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            })}
                        </span>
                    </span>
                    <span className="text-primary/70">
                        Credit:{' '}
                        <span className="text-primary font-semibold">
                            {totals.totalCredit.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                            })}
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

            <div className="flex flex-col gap-2">
                <label className="input-label">Attachments</label>
                <div
                    onClick={(e) => {
                        // Don't trigger file picker if clicking remove button
                        if ((e.target as HTMLElement).closest('button')) return;
                        fileInputRef.current?.click();
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[100px] ${
                        dragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-input hover:bg-muted/50 hover:border-primary/50'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                    />

                    {attachments.length > 0 ||
                    existingAttachments.length > 0 ? (
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-col gap-2 mb-2">
                                {/* Existing Attachments */}
                                {existingAttachments.map((file, index) => (
                                    <div
                                        key={`existing-${file.id}`}
                                        className="flex items-center justify-between p-2 bg-card border rounded-md shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden text-left">
                                                <span className="text-sm font-medium truncate max-w-[200px]">
                                                    {file.filename}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(
                                                        1
                                                    )}{' '}
                                                    KB (Existing)
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeExistingAttachment(index);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Remove file"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* New Attachments */}
                                {attachments.map((file, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className="flex items-center justify-between p-2 bg-card border rounded-md shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden text-left">
                                                <span className="text-sm font-medium truncate max-w-[200px]">
                                                    {file.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(
                                                        1
                                                    )}{' '}
                                                    KB
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeAttachment(index);
                                            }}
                                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Remove file"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload
                                className={`h-8 w-8 mb-3 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`}
                            />
                            <p className="text-sm font-medium">
                                {dragActive
                                    ? 'Drop files here'
                                    : 'Click or drag files to upload'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Max size 10MB per file
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
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
                    size="default"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="default"
                    size="default"
                    loading={isLoading}
                    startIcon={<Save className="w-4 h-4" />}
                >
                    Save
                </Button>
            </div>
        </form>
    );
}
