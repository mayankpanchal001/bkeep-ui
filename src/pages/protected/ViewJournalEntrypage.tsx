import { Column, DataTable } from '@/components/shared/DataTable';
import Loading from '@/components/shared/Loading';
import PageHeader from '@/components/shared/PageHeader';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useContacts } from '@/services/apis/contactsApi';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useJournalEntry } from '../../services/apis/journalApi';
import type { JournalEntry, JournalEntryLine } from '../../types/journal';

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

const formatDateTime = (value: unknown) => {
    if (typeof value !== 'string' || !value) return '—';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleString();
};

const formatText = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    const str = String(value).trim();
    return str ? str : '—';
};

const formatBoolean = (value: unknown) => {
    if (typeof value !== 'boolean') return '—';
    return value ? 'Yes' : 'No';
};

export default function ViewJournalEntrypage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useJournalEntry(id!);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

    const { data: contactsData } = useContacts({
        page: 1,
        limit: 200,
        isActive: true,
        sort: 'displayName',
        order: 'asc',
    });

    const contactNameById = useMemo(() => {
        const items =
            (
                contactsData as unknown as {
                    data?: {
                        items?: Array<{ id: string; displayName: string }>;
                    };
                }
            )?.data?.items || [];
        const map = new Map<string, string>();
        for (const c of items) {
            if (c?.id) map.set(c.id, c.displayName);
        }
        return map;
    }, [contactsData]);

    const columns: Column<JournalEntryLine>[] = [
        {
            header: '#',
            accessorKey: 'lineNumber',
            className: 'w-16 text-primary/50',
        },
        {
            header: 'Account',
            accessorKey: 'accountName',
            cell: (line) => (
                <div>
                    <div className="font-medium text-primary">
                        {line.account?.accountNumber
                            ? `${line.account.accountNumber} - ${
                                  line.account.accountName || ''
                              }`.trim()
                            : line.accountName || line.accountId}
                    </div>
                    {(line.account?.accountType || line.name) && (
                        <div className="text-xs text-primary/50">
                            {line.account?.accountType || line.name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: (line) => (
                <div className="text-primary/75">
                    {line.description ? line.description : '—'}
                    {line.memo && line.memo !== line.description && (
                        <div className="text-xs text-primary/50 mt-0.5">
                            Memo: {line.memo}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Contact',
            accessorKey: 'contactId',
            cell: (line) => (
                <span className="text-primary/75">
                    {line.contactId
                        ? contactNameById.get(line.contactId) || line.contactId
                        : '—'}
                </span>
            ),
        },
        {
            header: 'Debit',
            accessorKey: 'debit',
            className: 'text-right font-medium text-primary',
            cell: (line) => `$${toNumber(line.debit).toFixed(2)}`,
        },
        {
            header: 'Credit',
            accessorKey: 'credit',
            className: 'text-right font-medium text-primary',
            cell: (line) => `$${toNumber(line.credit).toFixed(2)}`,
        },
    ];

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

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: {
                bg: 'bg-gray-100',
                text: 'text-primary/70',
                label: 'Draft',
            },
            posted: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                label: 'Posted',
            },
            voided: { bg: 'bg-red-100', text: 'text-red-700', label: 'Voided' },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.draft;

        return (
            <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title={`Journal Entry ${formatText(journalEntry.entryNumber)}`}
                subtitle={formatDateOnly(journalEntry.entryDate)}
            />

            {/* Essential Details - Always Visible */}
            <div className="bg-card rounded-lg border border-primary/10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Status
                        </label>
                        {getStatusBadge(formatText(journalEntry.status))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Entry Number
                        </label>
                        <p className="text-primary font-medium">
                            {formatText(journalEntry.entryNumber)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Entry Date
                        </label>
                        <p className="text-primary font-medium">
                            {formatDateOnly(journalEntry.entryDate)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Entry Type
                        </label>
                        <p className="text-primary font-medium capitalize">
                            {formatText(journalEntry.entryType)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg border border-primary/10 overflow-hidden">
                <div className="px-4 py-2 border-b border-primary/10">
                    <h3 className="text-base font-semibold text-primary">
                        Journal Lines
                    </h3>
                </div>
                <DataTable
                    data={journalEntry.lines}
                    columns={columns}
                    containerClassName="border-none rounded-none"
                    tableClassName="w-full"
                    footerContent={
                        <tr className="bg-card border-t border-primary/10">
                            <td
                                colSpan={4}
                                className="px-3 py-2 text-right font-semibold text-sm text-primary"
                            >
                                Total
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                ${toNumber(journalEntry.totalDebit).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                ${toNumber(journalEntry.totalCredit).toFixed(2)}
                            </td>
                        </tr>
                    }
                />
            </div>

            {/* Additional Details - Collapsible */}
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <div className="bg-card rounded-lg border border-primary/10 overflow-hidden">
                    <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors">
                        <h3 className="text-base font-semibold text-primary">
                            Additional Details
                        </h3>
                        <ChevronDown
                            className={`w-4 h-4 text-primary/50 transition-transform duration-200 ${
                                isDetailsOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        ID
                                    </label>
                                    <p className="text-primary font-medium break-all text-sm">
                                        {formatText(journalEntry.id)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Reference
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.reference)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Source Module
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.sourceModule)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Source ID
                                    </label>
                                    <p className="text-primary font-medium break-all text-sm">
                                        {formatText(journalEntry.sourceId)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Adjusting
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatBoolean(
                                            journalEntry.isAdjusting
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Closing
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatBoolean(journalEntry.isClosing)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Reversing
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatBoolean(
                                            journalEntry.isReversing
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Reversal Date
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateOnly(
                                            journalEntry.reversalDate
                                        )}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Memo
                                    </label>
                                    <p className="text-primary font-medium whitespace-pre-wrap text-sm">
                                        {formatText(journalEntry.memo)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Approved By
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.approvedBy)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Approved At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(
                                            journalEntry.approvedAt
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Posted By
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatText(journalEntry.postedBy)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Posted At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(journalEntry.postedAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Created At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(journalEntry.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Updated At
                                    </label>
                                    <p className="text-primary font-medium text-sm">
                                        {formatDateTime(journalEntry.updatedAt)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Total Debit
                                    </label>
                                    <p className="text-primary font-semibold text-sm">
                                        $
                                        {toNumber(
                                            journalEntry.totalDebit
                                        ).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary/50 mb-1">
                                        Total Credit
                                    </label>
                                    <p className="text-primary font-semibold text-sm">
                                        $
                                        {toNumber(
                                            journalEntry.totalCredit
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>

            {(() => {
                const attachments = journalEntry.attachments || [];
                if (attachments.length === 0) return null;
                return (
                    <div className="bg-card rounded-lg border border-primary/10 p-3">
                        <h3 className="text-sm font-medium text-primary mb-2">
                            Attachments
                        </h3>
                        <div className="space-y-2">
                            {attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border border-primary/10 rounded-lg"
                                >
                                    <span className="text-sm text-primary">
                                        {attachment}
                                    </span>
                                    <a
                                        href={attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
