import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Icons } from '@/components/shared/Icons';
import Loading from '@/components/shared/Loading';
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
import { useState } from 'react';
import { FaFileAlt, FaRedo, FaUndo } from 'react-icons/fa';
import { useNavigate } from 'react-router';
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
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [sortKey, setSortKey] = useState<string | null>('journalDate');
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

    const { data, isLoading } = useJournalEntries(filters);
    const { mutate: deleteEntry, isPending: isDeleting } =
        useDeleteJournalEntry();
    const { mutate: postEntry, isPending: isPosting } = usePostJournalEntry();
    const { mutate: voidEntry, isPending: isVoiding } = useVoidJournalEntry();
    const { mutate: reverseEntry } = useReverseJournalEntry();
    const { mutate: restoreEntry } = useRestoreJournalEntry();

    const journalEntries = data?.data?.journalEntries || [];
    const total = data?.data?.total || 0;
    const rowIds = journalEntries.map((e) => e.id);

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
        if (deleteDialog.entry) {
            deleteEntry(deleteDialog.entry.id, {
                onSuccess: () => {
                    setDeleteDialog({ isOpen: false, entry: null });
                },
            });
        }
    };

    const handlePost = (entry: JournalEntry) => {
        setPostDialog({ isOpen: true, entry });
    };

    const handleConfirmPost = () => {
        if (postDialog.entry) {
            postEntry(postDialog.entry.id, {
                onSuccess: () => {
                    setPostDialog({ isOpen: false, entry: null });
                },
            });
        }
    };

    const handleVoid = (entry: JournalEntry) => {
        setVoidDialog({ isOpen: true, entry });
    };

    const handleConfirmVoid = () => {
        if (voidDialog.entry) {
            voidEntry(voidDialog.entry.id, {
                onSuccess: () => {
                    setVoidDialog({ isOpen: false, entry: null });
                },
            });
        }
    };

    const handleReverse = (entry: JournalEntry) => {
        reverseEntry(entry.id);
    };

    const handleRestore = (entry: JournalEntry) => {
        restoreEntry(entry.id);
    };

    const handleSortChange = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
    };

    const handleBulkPost = () => {
        console.log('Posting entries:', selectedItems);
        setSelectedItems([]);
    };

    const handleBulkDelete = () => {
        console.log('Deleting entries:', selectedItems);
        setSelectedItems([]);
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

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Journal Entries"
                subtitle={`${total} total entries`}
            />

            {/* Filters */}
            <div className="bg-white rounded-lg border border-primary/10 p-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filters.search || ''}
                        onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                        }
                        className="px-2 py-1.5 text-sm border border-primary/10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                    />

                    <select
                        value={filters.status || ''}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                status: e.target.value as
                                    | 'draft'
                                    | 'posted'
                                    | 'voided'
                                    | undefined,
                            })
                        }
                        className="px-2 py-1.5 text-sm border border-primary/10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="posted">Posted</option>
                        <option value="voided">Voided</option>
                    </select>

                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                startDate: e.target.value,
                            })
                        }
                        className="px-2 py-1.5 text-sm border border-primary/10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        placeholder="Start Date"
                    />

                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) =>
                            setFilters({ ...filters, endDate: e.target.value })
                        }
                        className="px-2 py-1.5 text-sm border border-primary/10 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        placeholder="End Date"
                    />
                </div>
            </div>

            {/* Journal Entries Table */}
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
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                    >
                        Post Selected
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                    >
                        Delete Selected
                    </button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="journalDate">Date</TableHead>
                        <TableHead sortable sortKey="journalNo">Journal No.</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead align="right" sortable sortKey="totalDebit">Debit</TableHead>
                        <TableHead align="right" sortable sortKey="totalCredit">Credit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {journalEntries.length === 0 ? (
                        <TableEmptyState
                            colSpan={8}
                            message="No journal entries found"
                            description="Create your first journal entry to get started"
                            icon={<FaFileAlt className="w-12 h-12 text-primary/20" />}
                            action={
                                <Button variant="primary" size="sm" onClick={handleCreateNew}>
                                    <Icons.Plus className="w-4 h-4 mr-2" />
                                    Create Journal Entry
                                </Button>
                            }
                        />
                    ) : (
                        journalEntries.map((entry) => (
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
                                        {new Date(entry.journalDate).toLocaleDateString()}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="whitespace-nowrap font-medium text-primary">
                                        {entry.journalNo}
                                        {entry.isAdjusting && (
                                            <span className="ml-2 text-xs text-blue-600">
                                                (Adj)
                                            </span>
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-primary/75">
                                        {entry.memo || entry.lines[0]?.description || '—'}
                                    </span>
                                </TableCell>
                                <TableCell align="right">
                                    <span className="whitespace-nowrap text-primary">
                                        ${entry.totalDebit.toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell align="right">
                                    <span className="whitespace-nowrap text-primary">
                                        ${entry.totalCredit.toFixed(2)}
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
                                                    onClick={() => handleEdit(entry.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    <Icons.Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePost(entry)}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                                                    title="Post"
                                                >
                                                    Post
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                >
                                                    <Icons.Trash className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {entry.status === 'posted' && (
                                            <>
                                                <button
                                                    onClick={() => handleVoid(entry)}
                                                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium hover:underline"
                                                    title="Void"
                                                >
                                                    Void
                                                </button>
                                                <button
                                                    onClick={() => handleReverse(entry)}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="Reverse"
                                                >
                                                    <FaUndo className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {entry.status === 'voided' && (
                                            <button
                                                onClick={() => handleRestore(entry)}
                                                className="text-green-600 hover:text-green-800"
                                                title="Restore"
                                            >
                                                <FaRedo className="w-4 h-4" />
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
                message={`Are you sure you want to delete journal entry "${deleteDialog.entry?.journalNo}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={isDeleting}
            />

            {/* Post Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={postDialog.isOpen}
                onClose={() => setPostDialog({ isOpen: false, entry: null })}
                onConfirm={handleConfirmPost}
                title="Post Journal Entry"
                message={`Are you sure you want to post journal entry "${postDialog.entry?.journalNo}"? Posted entries cannot be edited.`}
                confirmText="Post"
                cancelText="Cancel"
                loading={isPosting}
            />

            {/* Void Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={voidDialog.isOpen}
                onClose={() => setVoidDialog({ isOpen: false, entry: null })}
                onConfirm={handleConfirmVoid}
                title="Void Journal Entry"
                message={`Are you sure you want to void journal entry "${voidDialog.entry?.journalNo}"? This will mark it as voided.`}
                confirmText="Void"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={isVoiding}
            />
        </div>
    );
}
