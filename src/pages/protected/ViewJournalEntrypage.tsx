import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Column, DataTable } from '@/components/shared/DataTable';
import { Icons } from '@/components/shared/Icons';
import Loading from '@/components/shared/Loading';
import PageHeader from '@/components/shared/PageHeader';
import Button from '@/components/typography/Button';
import { useContacts } from '@/services/apis/contactsApi';
import { showErrorToast, showSuccessToast } from '@/utills/toast';
import { Redo2, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    useDeleteJournalEntry,
    useJournalEntry,
    usePostJournalEntry,
    useRestoreJournalEntry,
    useReverseJournalEntry,
    useVoidJournalEntry,
} from '../../services/apis/journalApi';
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
    const navigate = useNavigate();
    const { data, isLoading } = useJournalEntry(id!);

    const postMutation = usePostJournalEntry();
    const voidMutation = useVoidJournalEntry();
    const reverseMutation = useReverseJournalEntry();
    const restoreMutation = useRestoreJournalEntry();
    const deleteMutation = useDeleteJournalEntry();

    const [postDialog, setPostDialog] = useState(false);
    const [voidDialog, setVoidDialog] = useState(false);
    const [reverseDialog, setReverseDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

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
                <Button
                    variant="outline"
                    onClick={() => navigate('/journal-entries')}
                >
                    Back to List
                </Button>
            </div>
        );
    }

    const { status } = journalEntry;

    // Actions Handlers
    const handleEdit = () => {
        navigate(`/journal-entries/${journalEntry.id}/edit`);
    };

    const handleConfirmPost = () => {
        postMutation.mutate(journalEntry.id, {
            onSuccess: () => {
                setPostDialog(false);
                showSuccessToast('Journal entry posted');
            },
            onError: () => showErrorToast('Failed to post entry'),
        });
    };

    const handleConfirmVoid = () => {
        voidMutation.mutate(journalEntry.id, {
            onSuccess: () => {
                setVoidDialog(false);
                showSuccessToast('Journal entry voided');
            },
            onError: () => showErrorToast('Failed to void entry'),
        });
    };

    const handleConfirmReverse = () => {
        reverseMutation.mutate(journalEntry.id, {
            onSuccess: () => {
                setReverseDialog(false);
                showSuccessToast('Journal entry reversed');
            },
            onError: () => showErrorToast('Failed to reverse entry'),
        });
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate(journalEntry.id, {
            onSuccess: () => {
                setDeleteDialog(false);
                showSuccessToast('Journal entry deleted');
                navigate('/journal-entries');
            },
            onError: () => showErrorToast('Failed to delete entry'),
        });
    };

    const handleRestore = () => {
        restoreMutation.mutate(journalEntry.id, {
            onSuccess: () => {
                showSuccessToast('Journal entry restored');
            },
            onError: () => showErrorToast('Failed to restore entry'),
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: {
                bg: 'bg-gray-100 dark:bg-gray-500',
                text: 'text-primary/70 dark:text-white',
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                    <PageHeader
                        title={`Journal Entry ${formatText(journalEntry.entryNumber)}`}
                        subtitle={formatDateOnly(journalEntry.entryDate)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {status === 'draft' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleEdit}
                                icon={<Icons.Edit className="w-4 h-4" />}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPostDialog(true)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                                Post
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setVoidDialog(true)}
                                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            >
                                Void
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteDialog(true)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                icon={<Icons.Trash className="w-4 h-4" />}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                    {status === 'posted' && (
                        <Button
                            variant="outline"
                            onClick={() => setReverseDialog(true)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            icon={<Undo2 className="w-4 h-4" />}
                        >
                            Reverse
                        </Button>
                    )}
                    {status === 'voided' && (
                        <Button
                            variant="outline"
                            onClick={handleRestore}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            icon={<Redo2 className="w-4 h-4" />}
                        >
                            Restore
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-primary/10 p-4">
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
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            ID
                        </label>
                        <p className="text-primary font-medium break-all">
                            {formatText(journalEntry.id)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Reference
                        </label>
                        <p className="text-primary font-medium">
                            {formatText(journalEntry.reference)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Source Module
                        </label>
                        <p className="text-primary font-medium">
                            {formatText(journalEntry.sourceModule)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Source ID
                        </label>
                        <p className="text-primary font-medium break-all">
                            {formatText(journalEntry.sourceId)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Adjusting
                        </label>
                        <p className="text-primary font-medium">
                            {formatBoolean(journalEntry.isAdjusting)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Closing
                        </label>
                        <p className="text-primary font-medium">
                            {formatBoolean(journalEntry.isClosing)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Reversing
                        </label>
                        <p className="text-primary font-medium">
                            {formatBoolean(journalEntry.isReversing)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Reversal Date
                        </label>
                        <p className="text-primary font-medium">
                            {formatDateOnly(journalEntry.reversalDate)}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Memo
                        </label>
                        <p className="text-primary font-medium whitespace-pre-wrap">
                            {formatText(journalEntry.memo)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Approved By
                        </label>
                        <p className="text-primary font-medium">
                            {formatText(journalEntry.approvedBy)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Approved At
                        </label>
                        <p className="text-primary font-medium">
                            {formatDateTime(journalEntry.approvedAt)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Posted By
                        </label>
                        <p className="text-primary font-medium">
                            {formatText(journalEntry.postedBy)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Posted At
                        </label>
                        <p className="text-primary font-medium">
                            {formatDateTime(journalEntry.postedAt)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Created At
                        </label>
                        <p className="text-primary font-medium">
                            {formatDateTime(journalEntry.createdAt)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Updated At
                        </label>
                        <p className="text-primary font-medium">
                            {formatDateTime(journalEntry.updatedAt)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Total Debit
                        </label>
                        <p className="text-primary font-semibold">
                            ${toNumber(journalEntry.totalDebit).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary/50 mb-1">
                            Total Credit
                        </label>
                        <p className="text-primary font-semibold">
                            ${toNumber(journalEntry.totalCredit).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
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
                        <tr className="bg-white border-t border-primary/10">
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

            {(() => {
                const attachments = journalEntry.attachments || [];
                if (attachments.length === 0) return null;
                return (
                    <div className="bg-white rounded-lg border border-primary/10 p-3">
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

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={postDialog}
                onClose={() => setPostDialog(false)}
                onConfirm={handleConfirmPost}
                title="Post Journal Entry"
                message={`Are you sure you want to post journal entry "${formatText(journalEntry.entryNumber)}"? Posted entries cannot be edited.`}
                confirmText="Post"
                cancelText="Cancel"
                loading={postMutation.isPending}
            />

            <ConfirmationDialog
                isOpen={voidDialog}
                onClose={() => setVoidDialog(false)}
                onConfirm={handleConfirmVoid}
                title="Void Journal Entry"
                message={`Are you sure you want to void journal entry "${formatText(journalEntry.entryNumber)}"? This will mark it as voided.`}
                confirmText="Void"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={voidMutation.isPending}
            />

            <ConfirmationDialog
                isOpen={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Journal Entry"
                message={`Are you sure you want to delete journal entry "${formatText(journalEntry.entryNumber)}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={deleteMutation.isPending}
            />

            <ConfirmationDialog
                isOpen={reverseDialog}
                onClose={() => setReverseDialog(false)}
                onConfirm={handleConfirmReverse}
                title="Reverse Journal Entry"
                message={`Are you sure you want to reverse journal entry "${formatText(journalEntry.entryNumber)}"? This will create a new reversing entry.`}
                confirmText="Reverse"
                cancelText="Cancel"
                loading={reverseMutation.isPending}
            />
        </div>
    );
}
