import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import Loading from '@/components/shared/Loading';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useChartOfAccounts } from '@/services/apis/chartsAccountApi';
import { Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '../../components/ui/badge';
import {
    useCreateJournalEntry,
    useJournalEntries,
    useJournalEntry,
    useUpdateJournalEntry,
} from '../../services/apis/journalApi';
import type {
    CreateJournalEntryPayload,
    JournalEntry,
} from '../../types/journal';

const toNumber = (v: unknown) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

const formatDateOnly = (value: unknown) => {
    if (typeof value !== 'string' || !value) return '—';
    const normalized = value.includes('T') ? value : `${value}T00:00:00`;
    const dt = new Date(normalized);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString();
};

const formatText = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    const str = String(value).trim();
    return str ? str : '—';
};

// Helper function to get next journal entry number
function getNextJournalEntryNumber(current: string | undefined | null): string {
    if (!current) return '1';

    // Numbers
    if (/^\d+$/.test(current)) {
        const nextNum = parseInt(current, 10) + 1;

        if (current.startsWith('0') && current.length > 1) {
            return String(nextNum).padStart(current.length, '0');
        }
        return String(nextNum);
    }

    const match = current.match(/^(.*?)(\d+)$/);
    if (match) {
        const prefix = match[1];
        const numberPart = match[2];
        const nextNum = parseInt(numberPart, 10) + 1;

        const nextNumStr = String(nextNum).padStart(numberPart.length, '0');
        return prefix + nextNumStr;
    }

    // Letters updating
    if (/^[a-zA-Z]+$/.test(current)) {
        const chars = current.split('');
        let i = chars.length - 1;
        while (i >= 0) {
            const charCode = chars[i].charCodeAt(0);
            if (chars[i] === 'z') {
                chars[i] = 'a';
                i--;
            } else if (chars[i] === 'Z') {
                chars[i] = 'A';
                i--;
            } else {
                chars[i] = String.fromCharCode(charCode + 1);
                return chars.join('');
            }
        }
    }
    return '1';
}

export default function ViewJournalEntrypage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useJournalEntry(id!);

    const [showCopyPreview, setShowCopyPreview] = useState(false);
    const [copyPreviewData, setCopyPreviewData] =
        useState<CreateJournalEntryPayload | null>(null);

    const createMutation = useCreateJournalEntry();
    const { mutate: updateEntry, isPending: isUpdating } =
        useUpdateJournalEntry();

    const { data: allEntriesData } = useJournalEntries({
        page: 1,
        limit: 100,
        sort: 'entryNumber',
        order: 'desc',
    });

    const { data: accountsData } = useChartOfAccounts({
        page: 1,
        limit: 200,
    });

    const accountNameMap = useMemo(() => {
        const accounts = accountsData?.data?.items || [];
        const map = new Map<string, string>();
        for (const account of accounts) {
            if (account?.id) {
                const label = account.accountNumber
                    ? `${account.accountNumber} - ${account.accountName}`
                    : account.accountName;
                map.set(account.id, label);
            }
        }
        return map;
    }, [accountsData]);

    const journalEntry = useMemo<JournalEntry | undefined>(() => {
        const root = data as unknown as Record<string, unknown> | undefined;
        const firstData = root?.data as Record<string, unknown> | undefined;
        const candidates = [
            firstData?.journalEntry,
            firstData?.data,
            firstData,
            root?.journalEntry,
        ];
        const entry = candidates.find(
            (v) => typeof v === 'object' && v !== null
        ) as Record<string, unknown> | undefined;
        if (!entry) return undefined;
        if (typeof entry.id === 'string' && Array.isArray(entry.lines))
            return entry as unknown as JournalEntry;
        if (
            typeof (entry as { journalEntry?: unknown }).journalEntry ===
                'object' &&
            (entry as { journalEntry?: Record<string, unknown> }).journalEntry
        ) {
            const nested = (entry as { journalEntry: Record<string, unknown> })
                .journalEntry;
            if (typeof nested.id === 'string' && Array.isArray(nested.lines))
                return nested as unknown as JournalEntry;
        }
        return undefined;
    }, [data]);

    const highestEntryNumber = useMemo(() => {
        const entries = allEntriesData?.data?.journalEntries || [];
        if (entries.length === 0) return null;

        let highest: string | null = null;
        let highestNumeric = -1;

        entries.forEach((entry) => {
            if (!entry.entryNumber) return;
            const match = entry.entryNumber.match(/(\d+)$/);
            if (match) {
                const numeric = parseInt(match[1], 10);
                if (numeric > highestNumeric) {
                    highestNumeric = numeric;
                    highest = entry.entryNumber;
                }
            } else if (/^\d+$/.test(entry.entryNumber)) {
                const numeric = parseInt(entry.entryNumber, 10);
                if (numeric > highestNumeric) {
                    highestNumeric = numeric;
                    highest = entry.entryNumber;
                }
            }
        });
        return highest;
    }, [allEntriesData]);

    const normalizeDate = (value: string) => {
        return value && value.includes('T') ? value.split('T')[0] : value;
    };

    const handleSave = (payload: CreateJournalEntryPayload) => {
        if (!id) return;
        updateEntry(
            { id, payload },
            {
                onSuccess: () => {
                    navigate('/journal-entries');
                },
            }
        );
    };

    const handleCopy = () => {
        if (!id || !journalEntry) return;

        const baseEntryNumber = highestEntryNumber || journalEntry.entryNumber;
        const nextEntryNumber = getNextJournalEntryNumber(baseEntryNumber);

        const copyPayload: CreateJournalEntryPayload = {
            entryNumber: nextEntryNumber,
            entryDate: normalizeDate(journalEntry.entryDate),
            entryType: journalEntry.entryType || 'standard',
            isAdjusting: journalEntry.isAdjusting,
            isClosing: journalEntry.isClosing || false,
            isReversing: false,
            reversalDate: null,
            description: journalEntry.memo || '',
            memo: journalEntry.memo || '',
            reference: journalEntry.reference || '',
            lines: journalEntry.lines.map((line) => ({
                accountId: line.accountId,
                lineNumber: line.lineNumber,
                debit:
                    typeof line.debit === 'string'
                        ? parseFloat(line.debit) || 0
                        : line.debit,
                credit:
                    typeof line.credit === 'string'
                        ? parseFloat(line.credit) || 0
                        : line.credit,
                description: line.description || '',
                memo: line.memo || line.description || '',
                contactId: line.contactId || '',
                taxId: line.taxId || '',
            })),
        };

        setCopyPreviewData(copyPayload);
        setShowCopyPreview(true);
    };

    const handleConfirmCopy = () => {
        if (!copyPreviewData) return;

        createMutation.mutate(copyPreviewData, {
            onSuccess: (data) => {
                setShowCopyPreview(false);
                setCopyPreviewData(null);
                const newEntryId = data?.data?.journalEntry?.id;
                if (newEntryId) {
                    navigate(`/journal-entries/${newEntryId}`);
                } else {
                    navigate('/journal-entries');
                }
            },
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!journalEntry) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600">Journal entry not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title={`Journal Entry ${formatText(journalEntry.entryNumber)}`}
                subtitle="Update journal entry details"
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            disabled={createMutation.isPending}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {createMutation.isPending ? 'Copying...' : 'Copy'}
                        </Button>
                    </div>
                }
            />

            <div className="bg-card rounded-lg border border-primary/10 p-4">
                <JournalEntryForm
                    initialData={{
                        entryNumber: journalEntry.entryNumber,
                        entryDate: normalizeDate(journalEntry.entryDate),
                        entryType:
                            journalEntry.entryType ||
                            (journalEntry.isAdjusting
                                ? 'adjusting'
                                : 'standard'),
                        isAdjusting: journalEntry.isAdjusting,
                        lines: journalEntry.lines.map((line, index) => ({
                            id: line.id,
                            accountId: line.accountId,
                            lineNumber: index + 1,
                            debit:
                                typeof line.debit === 'string'
                                    ? parseFloat(line.debit) || 0
                                    : line.debit,
                            credit:
                                typeof line.credit === 'string'
                                    ? parseFloat(line.credit) || 0
                                    : line.credit,
                            description: line.description,
                            memo: line.memo || line.description,
                            contactId: line.contactId || '',
                            taxId: line.taxId || '',
                        })),
                        description: journalEntry.memo,
                        memo: journalEntry.memo || '',
                        existingAttachments: journalEntry.attachments || [],
                    }}
                    onSubmit={handleSave}
                    onCancel={() => navigate('/journal-entries')}
                    isLoading={isUpdating}
                />
            </div>

            <Dialog open={showCopyPreview} onOpenChange={setShowCopyPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview Copy Journal Entry</DialogTitle>
                        <DialogDescription>
                            Review the details of the journal entry that will be
                            created. The new entry will be in Draft status.
                        </DialogDescription>
                    </DialogHeader>

                    {copyPreviewData && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg border border-primary/10">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        New Entry Number
                                    </label>
                                    <p className="text-primary font-semibold">
                                        {copyPreviewData.entryNumber}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Entry Date
                                    </label>
                                    <p className="text-primary font-medium">
                                        {formatDateOnly(
                                            copyPreviewData.entryDate
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Entry Type
                                    </label>
                                    <p className="text-primary font-medium capitalize">
                                        {copyPreviewData.entryType ||
                                            'standard'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Status
                                    </label>
                                    <Badge
                                        variant="secondary"
                                        className="text-primary/70"
                                    >
                                        Draft
                                    </Badge>
                                </div>
                            </div>

                            {(copyPreviewData.memo ||
                                copyPreviewData.description) && (
                                <div className="p-4 bg-card rounded-lg border border-primary/10">
                                    <label className="block text-sm font-medium text-primary/50 mb-2">
                                        Memo
                                    </label>
                                    <p className="text-primary text-sm whitespace-pre-wrap">
                                        {copyPreviewData.memo ||
                                            copyPreviewData.description ||
                                            '—'}
                                    </p>
                                </div>
                            )}

                            <div className="border border-primary/10 rounded-lg overflow-hidden">
                                <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
                                    <h3 className="text-sm font-semibold text-primary">
                                        Journal Lines (
                                        {copyPreviewData.lines.length} lines)
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-primary/5">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-primary/70">
                                                    #
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-primary/70">
                                                    Account
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-primary/70">
                                                    Description
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-medium text-primary/70">
                                                    Debit
                                                </th>
                                                <th className="px-3 py-2 text-right text-xs font-medium text-primary/70">
                                                    Credit
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {copyPreviewData.lines.map(
                                                (line, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-primary/10 hover:bg-primary/5"
                                                    >
                                                        <td className="px-3 py-2 text-sm text-primary/50">
                                                            {line.lineNumber}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-primary">
                                                            {line.accountId
                                                                ? accountNameMap.get(
                                                                      line.accountId
                                                                  ) ||
                                                                  line.accountId
                                                                : '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-primary/75">
                                                            {line.description ||
                                                                '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right font-medium text-primary">
                                                            {toNumber(
                                                                line.debit
                                                            ).toLocaleString(
                                                                'en-US',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'USD',
                                                                }
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right font-medium text-primary">
                                                            {toNumber(
                                                                line.credit
                                                            ).toLocaleString(
                                                                'en-US',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'USD',
                                                                }
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                        <tfoot className="bg-primary/5">
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-3 py-2 text-right font-semibold text-sm text-primary"
                                                >
                                                    Total
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                                    {copyPreviewData.lines
                                                        .reduce(
                                                            (sum, line) =>
                                                                sum +
                                                                toNumber(
                                                                    line.debit
                                                                ),
                                                            0
                                                        )
                                                        .toLocaleString(
                                                            'en-US',
                                                            {
                                                                style: 'currency',
                                                                currency: 'USD',
                                                            }
                                                        )}
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                                    {copyPreviewData.lines
                                                        .reduce(
                                                            (sum, line) =>
                                                                sum +
                                                                toNumber(
                                                                    line.credit
                                                                ),
                                                            0
                                                        )
                                                        .toLocaleString(
                                                            'en-US',
                                                            {
                                                                style: 'currency',
                                                                currency: 'USD',
                                                            }
                                                        )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCopyPreview(false);
                                setCopyPreviewData(null);
                            }}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmCopy}
                            disabled={createMutation.isPending}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {createMutation.isPending
                                ? 'Creating...'
                                : 'Create Copy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
