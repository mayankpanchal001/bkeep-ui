import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Icons } from '@/components/shared/Icons';
import PageHeader from '@/components/shared/PageHeader';
import Button from '@/components/typography/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableHead,
    TableHeader,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
    type SortDirection,
} from '@/components/ui/table';
import { showErrorToast, showSuccessToast } from '@/utills/toast.tsx';
import { FileText, Redo2, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Input from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { useContacts } from '../../services/apis/contactsApi';
import {
    useDeleteJournalEntry,
    useJournalEntries,
    usePostJournalEntry,
    useRestoreJournalEntry,
    useReverseJournalEntry,
    useVoidJournalEntry,
} from '../../services/apis/journalApi';
import type { JournalEntry, JournalEntryFilters } from '../../types/journal';

export default function JournalEntriespage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<JournalEntryFilters>({
        page: 1,
        limit: 20,
    });
    const [searchInput, setSearchInput] = useState('');
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [sortKey, setSortKey] = useState<string | null>('entryDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        entry: JournalEntry | null;
    }>({ isOpen: false, entry: null });
    const [postDialog, setPostDialog] = useState<{
        isOpen: boolean;
        entry: JournalEntry | null;
    }>({ isOpen: false, entry: null });
    const [voidDialog, setVoidDialog] = useState<{
        isOpen: boolean;
        entry: JournalEntry | null;
    }>({ isOpen: false, entry: null });

    const { data, isLoading, isFetching, error } = useJournalEntries(filters);
    const deleteMutation = useDeleteJournalEntry();
    const postMutation = usePostJournalEntry();
    const voidMutation = useVoidJournalEntry();
    const reverseMutation = useReverseJournalEntry();
    const restoreMutation = useRestoreJournalEntry();

    const { data: contactsData } = useContacts({
        page: 1,
        limit: 200,
        isActive: true,
        sort: 'displayName',
        order: 'asc',
    });

    const contactNameById = useMemo(() => {
        const items = contactsData?.data?.items || [];
        const map = new Map<string, string>();
        for (const c of items) {
            map.set(c.id, c.displayName);
        }
        return map;
    }, [contactsData]);

    const [bulkDialog, setBulkDialog] = useState<{
        isOpen: boolean;
        type: 'post' | 'delete' | null;
    }>({ isOpen: false, type: null });
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const journalEntries = useMemo(() => {
        const root = data as unknown as Record<string, unknown> | undefined;
        const firstData = root?.data as Record<string, unknown> | undefined;
        const secondData = firstData?.data as
            | Record<string, unknown>
            | undefined;

        const candidates = [
            firstData?.journalEntries,
            firstData?.items,
            secondData?.journalEntries,
            root?.journalEntries,
        ];

        const list = candidates.find(Array.isArray);
        return (list as JournalEntry[] | undefined) || [];
    }, [data]);

    const total = useMemo(() => {
        const root = data as unknown as Record<string, unknown> | undefined;
        const firstData = root?.data as Record<string, unknown> | undefined;
        const secondData = firstData?.data as
            | Record<string, unknown>
            | undefined;

        const candidates = [
            firstData?.total,
            (firstData?.pagination as Record<string, unknown> | undefined)
                ?.total,
            secondData?.total,
            root?.total,
        ];

        const value = candidates.find((v) => typeof v === 'number');
        return (value as number | undefined) || 0;
    }, [data]);

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setFilters((prev) => ({
                ...prev,
                search: searchInput.trim() || undefined,
                page: 1,
            }));
        }, 300);
        return () => window.clearTimeout(handle);
    }, [searchInput]);

    const handleCreateNew = () => {
        navigate('/journal-entries/new');
    };

    const handleEdit = (id: string) => {
        navigate(`/journal-entries/${id}/edit`);
    };

    const handleView = (id: string) => {
        navigate(`/journal-entries/${id}`);
    };

    const handleDelete = (entry: JournalEntry) => {
        setDeleteDialog({ isOpen: true, entry });
    };

    const handleConfirmDelete = () => {
        if (!deleteDialog.entry) return;
        deleteMutation.mutate(deleteDialog.entry.id, {
            onSuccess: () => {
                showSuccessToast('Journal entry deleted');
                setDeleteDialog({ isOpen: false, entry: null });
            },
            onError: () => showErrorToast('Failed to delete entry'),
        });
    };

    const handlePost = (entry: JournalEntry) => {
        setPostDialog({ isOpen: true, entry });
    };

    const handleConfirmPost = () => {
        if (!postDialog.entry) return;
        postMutation.mutate(postDialog.entry.id, {
            onSuccess: () => {
                showSuccessToast('Journal entry posted');
                setPostDialog({ isOpen: false, entry: null });
            },
            onError: () => showErrorToast('Failed to post entry'),
        });
    };

    const handleVoid = (entry: JournalEntry) => {
        setVoidDialog({ isOpen: true, entry });
    };

    const handleConfirmVoid = () => {
        if (!voidDialog.entry) return;
        voidMutation.mutate(voidDialog.entry.id, {
            onSuccess: () => {
                showSuccessToast('Journal entry voided');
                setVoidDialog({ isOpen: false, entry: null });
            },
            onError: () => showErrorToast('Failed to void entry'),
        });
    };

    const handleReverse = (entry: JournalEntry) => {
        reverseMutation.mutate(entry.id, {
            onSuccess: () => showSuccessToast('Journal entry reversed'),
            onError: () => showErrorToast('Failed to reverse entry'),
        });
    };

    const handleRestore = (entry: JournalEntry) => {
        restoreMutation.mutate(entry.id, {
            onSuccess: () => showSuccessToast('Journal entry restored'),
            onError: () => showErrorToast('Failed to restore entry'),
        });
    };

    const handleSortChange = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
    };

    const handleBulkPost = () => {
        if (selectedItems.length === 0) return;
        setBulkDialog({ isOpen: true, type: 'post' });
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;
        setBulkDialog({ isOpen: true, type: 'delete' });
    };

    const handleConfirmBulk = async () => {
        const selectedIds = selectedItems.map(String);
        const selectedEntries = journalEntries.filter((e) =>
            selectedIds.includes(e.id)
        );

        const eligible =
            bulkDialog.type === 'post'
                ? selectedEntries.filter((e) => e.status === 'draft')
                : selectedEntries.filter((e) => e.status === 'draft');

        if (eligible.length === 0) {
            showErrorToast('No draft entries selected');
            setBulkDialog({ isOpen: false, type: null });
            return;
        }

        setIsBulkLoading(true);
        try {
            for (const entry of eligible) {
                if (bulkDialog.type === 'post') {
                    await postMutation.mutateAsync(entry.id);
                } else if (bulkDialog.type === 'delete') {
                    await deleteMutation.mutateAsync(entry.id);
                }
            }
            showSuccessToast(`${eligible.length} entries ${bulkDialog.type}ed`);
            setSelectedItems([]);
            setBulkDialog({ isOpen: false, type: null });
        } catch {
            showErrorToast(`Failed to ${bulkDialog.type} some entries`);
        } finally {
            setIsBulkLoading(false);
        }
    };

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
                className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    const totalPages = Math.ceil(total / (filters.limit || 20));

    const displayedEntries = useMemo(() => {
        const next = [...journalEntries];
        if (!sortKey || !sortDirection) return next;

        const direction = sortDirection === 'asc' ? 1 : -1;

        next.sort((a, b) => {
            if (sortKey === 'entryDate') {
                return (
                    (new Date(a.entryDate).getTime() -
                        new Date(b.entryDate).getTime()) *
                    direction
                );
            }
            if (sortKey === 'entryNumber') {
                return a.entryNumber.localeCompare(b.entryNumber) * direction;
            }
            if (sortKey === 'totalDebit') {
                return (
                    (Number(a.totalDebit || 0) - Number(b.totalDebit || 0)) *
                    direction
                );
            }
            if (sortKey === 'totalCredit') {
                return (
                    (Number(a.totalCredit || 0) - Number(b.totalCredit || 0)) *
                    direction
                );
            }
            return 0;
        });

        return next;
    }, [journalEntries, sortKey, sortDirection]);

    const rowIds = useMemo(
        () => displayedEntries.map((e) => e.id),
        [displayedEntries]
    );

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((id) => rowIds.includes(String(id)))
        );
    }, [rowIds]);

    return (
        <div className="space-y-4">
            <PageHeader
                title="Journal Entries"
                subtitle={`${total} total entries`}
            />

            {/* Filters */}

            <div className="flex flex-col md:flex-row gap-3 md:items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="px-2 py-1.5 text-sm border border-primary/10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                    />

                    <Select
                        value={filters.status || ''}
                        onValueChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                status: (value || undefined) as
                                    | 'draft'
                                    | 'posted'
                                    | 'voided'
                                    | undefined,
                                page: 1,
                            }))
                        }
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="posted">Posted</option>
                        <option value="voided">Voided</option>
                    </Select>

                    <Input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                startDate: e.target.value || undefined,
                                page: 1,
                            }))
                        }
                        className="px-2 py-1.5 text-sm border border-primary/10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        placeholder="Start Date"
                    />

                    <Input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                endDate: e.target.value || undefined,
                                page: 1,
                            }))
                        }
                        className="px-2 py-1.5 text-sm border border-primary/10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        placeholder="End Date"
                    />
                </div>

                <Button variant="primary" size="sm" onClick={handleCreateNew}>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    New
                </Button>
            </div>

            {/* Journal Entries Table */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Error loading journal entries: {error.message}
                </div>
            )}
            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
            >
                <TableSelectionToolbar>
                    <button
                        onClick={handleBulkPost}
                        disabled={
                            selectedItems.length === 0 ||
                            isBulkLoading ||
                            postMutation.isPending ||
                            deleteMutation.isPending
                        }
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50"
                    >
                        Post Selected
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={
                            selectedItems.length === 0 ||
                            isBulkLoading ||
                            postMutation.isPending ||
                            deleteMutation.isPending
                        }
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                    >
                        Delete Selected
                    </button>
                    {(isLoading || isFetching) && (
                        <span className="ml-auto text-xs text-primary/50">
                            Loading...
                        </span>
                    )}
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="entryDate">
                            Date
                        </TableHead>
                        <TableHead sortable sortKey="entryNumber">
                            Entry Number
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead align="right" sortable sortKey="totalDebit">
                            Debit
                        </TableHead>
                        <TableHead align="right" sortable sortKey="totalCredit">
                            Credit
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {displayedEntries.length === 0 ? (
                        <TableEmptyState
                            colSpan={9}
                            message="No journal entries found"
                            description="Create your first journal entry to get started"
                            icon={
                                <FileText className="w-12 h-12 text-primary/20" />
                            }
                            action={
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleCreateNew}
                                >
                                    <Icons.Plus className="w-4 h-4 mr-2" />
                                    Create Journal Entry
                                </Button>
                            }
                        />
                    ) : (
                        displayedEntries.map((entry) => (
                            <TableRow
                                key={entry.id}
                                rowId={entry.id}
                                onClick={() => handleView(entry.id)}
                            >
                                <TableCell>
                                    <TableRowCheckbox rowId={entry.id} />
                                </TableCell>
                                <TableCell>
                                    <span className="whitespace-nowrap text-primary">
                                        {new Date(
                                            entry.entryDate
                                        ).toLocaleDateString()}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="whitespace-nowrap font-medium text-primary">
                                        {entry.entryNumber}
                                        {entry.isAdjusting && (
                                            <span className="ml-2 text-xs text-blue-600">
                                                (Adj)
                                            </span>
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {entry.memo ||
                                            entry.lines[0]?.description ||
                                            '—'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {(() => {
                                        const ids = new Set<string>();
                                        for (const line of entry.lines || []) {
                                            if (line.contactId)
                                                ids.add(line.contactId);
                                        }
                                        const list = Array.from(ids);
                                        if (list.length === 0) {
                                            return (
                                                <span className="text-primary/40">
                                                    —
                                                </span>
                                            );
                                        }
                                        const firstId = list[0];
                                        const firstName =
                                            contactNameById.get(firstId) ||
                                            firstId;
                                        if (list.length === 1) {
                                            return (
                                                <span className="text-primary/75">
                                                    {firstName}
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className="text-primary/75">
                                                {firstName}
                                                <span className="ml-1 text-xs text-primary/50">
                                                    +{list.length - 1}
                                                </span>
                                            </span>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell align="right">
                                    <span className="whitespace-nowrap text-primary">
                                        $
                                        {Number(entry.totalDebit || 0).toFixed(
                                            2
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell align="right">
                                    <span className="whitespace-nowrap text-primary">
                                        $
                                        {Number(entry.totalCredit || 0).toFixed(
                                            2
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(entry.status)}
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex items-center gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {entry.status === 'draft' && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(entry.id)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                    title="Edit"
                                                    disabled={
                                                        deleteMutation.isPending ||
                                                        postMutation.isPending
                                                    }
                                                >
                                                    <Icons.Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handlePost(entry)
                                                    }
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline disabled:opacity-50"
                                                    title="Post"
                                                    disabled={
                                                        postMutation.isPending
                                                    }
                                                >
                                                    Post
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(entry)
                                                    }
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    title="Delete"
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                >
                                                    <Icons.Trash className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {entry.status === 'posted' && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleVoid(entry)
                                                    }
                                                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium hover:underline disabled:opacity-50"
                                                    title="Void"
                                                    disabled={
                                                        voidMutation.isPending
                                                    }
                                                >
                                                    Void
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleReverse(entry)
                                                    }
                                                    className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
                                                    title="Reverse"
                                                    disabled={
                                                        reverseMutation.isPending
                                                    }
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {entry.status === 'voided' && (
                                            <button
                                                onClick={() =>
                                                    handleRestore(entry)
                                                }
                                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                                title="Restore"
                                                disabled={
                                                    restoreMutation.isPending
                                                }
                                            >
                                                <Redo2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
                page={filters.page || 1}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={filters.limit || 20}
                onPageChange={(page) => setFilters({ ...filters, page })}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, entry: null })}
                onConfirm={handleConfirmDelete}
                title="Delete Journal Entry"
                message={`Are you sure you want to delete journal entry "${deleteDialog.entry?.entryNumber}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={deleteMutation.isPending}
            />

            {/* Post Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={postDialog.isOpen}
                onClose={() => setPostDialog({ isOpen: false, entry: null })}
                onConfirm={handleConfirmPost}
                title="Post Journal Entry"
                message={`Are you sure you want to post journal entry "${postDialog.entry?.entryNumber}"? Posted entries cannot be edited.`}
                confirmText="Post"
                cancelText="Cancel"
                loading={postMutation.isPending}
            />

            {/* Void Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={voidDialog.isOpen}
                onClose={() => setVoidDialog({ isOpen: false, entry: null })}
                onConfirm={handleConfirmVoid}
                title="Void Journal Entry"
                message={`Are you sure you want to void journal entry "${voidDialog.entry?.entryNumber}"? This will mark it as voided.`}
                confirmText="Void"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={voidMutation.isPending}
            />

            <ConfirmationDialog
                isOpen={bulkDialog.isOpen}
                onClose={() => setBulkDialog({ isOpen: false, type: null })}
                onConfirm={handleConfirmBulk}
                title={
                    bulkDialog.type === 'post'
                        ? `Post ${selectedItems.length} entries`
                        : `Delete ${selectedItems.length} entries`
                }
                message={
                    bulkDialog.type === 'post'
                        ? 'Only draft entries will be posted.'
                        : 'Only draft entries will be deleted.'
                }
                confirmText={bulkDialog.type === 'post' ? 'Post' : 'Delete'}
                confirmVariant={
                    bulkDialog.type === 'delete' ? 'danger' : 'primary'
                }
                loading={isBulkLoading}
            />
        </div>
    );
}
