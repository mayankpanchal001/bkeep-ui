import { Icons } from '@/components/shared/Icons';
import PageHeader from '@/components/shared/PageHeader';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
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
import { cn } from '@/utils/cn';
import {
    ArrowUpDown,
    ChevronUp,
    FileText,
    Filter,
    Redo2,
    Search,
    Undo2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '../../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import Input from '../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { useContacts } from '../../services/apis/contactsApi';
import {
    useDeleteJournalEntry,
    useJournalEntries,
    usePostJournalEntry,
    useRestoreJournalEntry,
    useReverseJournalEntry,
    useVoidJournalEntry,
} from '../../services/apis/journalApi';
import { useJournalEntriesFilterStore } from '../../stores/journalEntries/journalEntriesFilterStore';
import type { JournalEntry } from '../../types/journal';

export default function JournalEntriespage() {
    const navigate = useNavigate();
    const filterStore = useJournalEntriesFilterStore();

    // Select individual filter values to make them reactive
    const page = useJournalEntriesFilterStore((state) => state.page);
    const limit = useJournalEntriesFilterStore((state) => state.limit);
    const search = useJournalEntriesFilterStore((state) => state.search);
    const status = useJournalEntriesFilterStore((state) => state.status);
    const startDate = useJournalEntriesFilterStore((state) => state.startDate);
    const endDate = useJournalEntriesFilterStore((state) => state.endDate);
    const filterContact = useJournalEntriesFilterStore(
        (state) => state.filterContact
    );
    const filterAccountId = useJournalEntriesFilterStore(
        (state) => state.filterAccountId
    );
    const filterMinAmount = useJournalEntriesFilterStore(
        (state) => state.filterMinAmount
    );
    const filterMaxAmount = useJournalEntriesFilterStore(
        (state) => state.filterMaxAmount
    );
    const sort = useJournalEntriesFilterStore((state) => state.sort);
    const order = useJournalEntriesFilterStore((state) => state.order);

    const [searchInput, setSearchInput] = useState('');
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
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
    const [reverseDialog, setReverseDialog] = useState<{
        isOpen: boolean;
        entry: JournalEntry | null;
    }>({ isOpen: false, entry: null });
    const [reversalDate, setReversalDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Fetch contacts and accounts data first (needed for filter conversion)
    const { data: contactsData } = useContacts({
        page: 1,
        limit: 1000,
        isActive: true,
        sort: 'displayName',
        order: 'asc',
    });

    const { data: accountsData } = useChartOfAccounts({
        isActive: true,
        limit: 1000,
    });

    // Create a map of contactId -> displayName (needed for contact filter conversion)
    const contactNameById = useMemo(() => {
        const items = contactsData?.data?.items || [];
        const map = new Map<string, string>();
        for (const c of items) {
            if (c?.id && c?.displayName) {
                map.set(c.id, c.displayName);
            }
        }
        return map;
    }, [contactsData]);

    // Build API filters reactively from store values
    const apiFilters = useMemo(() => {
        const filters: Record<string, unknown> = {
            page,
            limit,
        };

        if (search) filters.search = search;
        if (status !== 'all') filters.status = status;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        // Convert contact display name to contactId
        if (filterContact) {
            // First, try to find contactId by displayName
            const contactId = Array.from(contactNameById.entries()).find(
                ([, name]) => name === filterContact
            )?.[0];
            // If found, use contactId; otherwise, check if it's already an ID
            if (contactId) {
                filters.contactId = contactId;
            } else if (contactNameById.has(filterContact)) {
                // It's already a contactId
                filters.contactId = filterContact;
            }
        }

        if (filterAccountId) filters.accountId = filterAccountId;
        if (filterMinAmount) {
            const minAmount = parseFloat(filterMinAmount);
            if (!isNaN(minAmount)) filters.minAmount = minAmount;
        }
        if (filterMaxAmount) {
            const maxAmount = parseFloat(filterMaxAmount);
            if (!isNaN(maxAmount)) filters.maxAmount = maxAmount;
        }
        if (sort) {
            filters.sort = sort;
            filters.order = order;
        }

        return filters;
    }, [
        page,
        limit,
        search,
        status,
        startDate,
        endDate,
        filterContact,
        filterAccountId,
        filterMinAmount,
        filterMaxAmount,
        sort,
        order,
        contactNameById,
    ]);

    const { data, error } = useJournalEntries(apiFilters);
    const deleteMutation = useDeleteJournalEntry();
    const postMutation = usePostJournalEntry();
    const voidMutation = useVoidJournalEntry();
    const reverseMutation = useReverseJournalEntry();
    const restoreMutation = useRestoreJournalEntry();

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
            filterStore.setSearch(searchInput.trim());
        }, 300);
        return () => window.clearTimeout(handle);
    }, [searchInput, filterStore]);

    // Create filter options
    const CONTACT_OPTIONS: ComboboxOption[] = useMemo(() => {
        const items = contactsData?.data?.items || [];
        return items.map((contact) => ({
            value: contact.displayName,
            label: contact.displayName,
        }));
    }, [contactsData]);

    const ACCOUNT_OPTIONS: ComboboxOption[] = useMemo(() => {
        const items = accountsData?.data?.items || [];
        return items.map((account) => ({
            value: account.id,
            label: `${account.accountNumber || ''} - ${account.accountName}`.trim(),
        }));
    }, [accountsData]);

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
        setReversalDate(new Date().toISOString().split('T')[0]);
        setReverseDialog({ isOpen: true, entry });
    };

    const handleConfirmReverse = () => {
        if (!reverseDialog.entry || !reversalDate) return;
        reverseMutation.mutate(
            {
                id: reverseDialog.entry.id,
                reversalDate,
            },
            {
                onSuccess: () => {
                    showSuccessToast('Journal entry reversed');
                    setReverseDialog({ isOpen: false, entry: null });
                },
                onError: () => showErrorToast('Failed to reverse entry'),
            }
        );
    };

    const handleRestore = (entry: JournalEntry) => {
        restoreMutation.mutate(entry.id, {
            onSuccess: () => showSuccessToast('Journal entry restored'),
            onError: () => showErrorToast('Failed to restore entry'),
        });
    };

    const handleSortChange = (key: string, direction: SortDirection) => {
        filterStore.setSort(direction ? key : null, direction || undefined);
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

    // Calculate total pages from API response
    const pagination = data?.data?.pagination;
    const totalPages =
        pagination?.totalPages || Math.ceil(total / (filterStore.limit || 20));
    const totalItems = pagination?.total || total;

    // No client-side sorting - API handles it
    const displayedEntries = journalEntries;

    const rowIds = useMemo(
        () => displayedEntries.map((e) => e.id),
        [displayedEntries]
    );

    useEffect(() => {
        setSelectedItems((prev) =>
            prev.filter((id) => rowIds.includes(String(id)))
        );
    }, [rowIds]);

    const getSortLabel = (sortKey: string | null): string => {
        if (!sortKey) return 'Sort by';
        const labels: Record<string, string> = {
            entryNumber: 'Entry Number',
            entryDate: 'Entry Date',
            entryType: 'Entry Type',
            status: 'Status',
            totalDebit: 'Total Debit',
            totalCredit: 'Total Credit',
            createdAt: 'Created At',
            updatedAt: 'Updated At',
        };
        return labels[sortKey] || 'Sort by';
    };

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Journal Entries"
                subtitle={`${total} total entries`}
            />

            {/* Filters */}
            <div className="p-4 border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="w-[260px]">
                        <Input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search..."
                            startIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <Button size="sm" onClick={handleCreateNew}>
                        <Icons.Plus className="w-2 h-2 mr-1" />
                        New
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'gap-2',
                                    filterStore.sort &&
                                        'border-primary/30 bg-primary/5'
                                )}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                                <span>{getSortLabel(filterStore.sort)}</span>
                                <ChevronUp className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuRadioGroup
                                value={filterStore.sort || 'none'}
                                onValueChange={(value) => {
                                    if (value === 'none') {
                                        filterStore.setSort(null);
                                    } else {
                                        filterStore.setSort(value);
                                    }
                                }}
                            >
                                <DropdownMenuRadioItem value="none">
                                    <span>No sorting</span>
                                </DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioItem value="entryNumber">
                                    <span>Entry Number</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filterStore.order === 'asc'
                                            ? 'A → Z'
                                            : 'Z → A'}
                                    </span>
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="entryDate">
                                    <span>Entry Date</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filterStore.order === 'asc'
                                            ? '1 → 9'
                                            : '9 → 1'}
                                    </span>
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="status">
                                    <span>Status</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filterStore.order === 'asc'
                                            ? 'A → Z'
                                            : 'Z → A'}
                                    </span>
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="totalDebit">
                                    <span>Total Debit</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filterStore.order === 'asc'
                                            ? 'Low → High'
                                            : 'High → Low'}
                                    </span>
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="totalCredit">
                                    <span>Total Credit</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filterStore.order === 'asc'
                                            ? 'Low → High'
                                            : 'High → Low'}
                                    </span>
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="createdAt">
                                    <span>Created At</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filterStore.order === 'asc'
                                            ? '1 → 9'
                                            : '9 → 1'}
                                    </span>
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="updatedAt">
                                    <span>Updated At</span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filterStore.order === 'asc'
                                            ? '1 → 9'
                                            : '9 → 1'}
                                    </span>
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                            {filterStore.sort && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1.5">
                                        <button
                                            onClick={() => {
                                                filterStore.setSortOrder(
                                                    filterStore.order === 'asc'
                                                        ? 'desc'
                                                        : 'asc'
                                                );
                                            }}
                                            className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {filterStore.order === 'asc'
                                                ? 'Switch to Descending'
                                                : 'Switch to Ascending'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Drawer
                        open={isFilterDrawerOpen}
                        onOpenChange={setIsFilterDrawerOpen}
                        direction="right"
                    >
                        <DrawerTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" /> Filters
                                {(filterStore.filterContact ||
                                    filterStore.filterAccountId ||
                                    filterStore.filterMinAmount ||
                                    filterStore.filterMaxAmount ||
                                    filterStore.startDate ||
                                    filterStore.endDate) && (
                                    <span className="ml-2 h-2 w-2 rounded-full bg-accent" />
                                )}
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="h-full w-full sm:w-[400px]">
                            <DrawerHeader className="border-b border-primary/10">
                                <div className="flex items-center justify-between">
                                    <DrawerTitle>
                                        Filter Journal Entries
                                    </DrawerTitle>
                                    <DrawerClose asChild>
                                        <button className="p-2 hover:bg-primary/5 rounded-full transition-colors">
                                            <X className="h-4 w-4 text-primary/70" />
                                        </button>
                                    </DrawerClose>
                                </div>
                            </DrawerHeader>
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Status
                                    </label>
                                    <Select
                                        value={filterStore.status}
                                        onValueChange={(value) =>
                                            filterStore.setStatus(
                                                value as
                                                    | 'draft'
                                                    | 'posted'
                                                    | 'voided'
                                                    | 'all'
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All
                                            </SelectItem>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="posted">
                                                Posted
                                            </SelectItem>
                                            <SelectItem value="voided">
                                                Voided
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Date Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="date"
                                            placeholder="Start Date"
                                            value={filterStore.startDate}
                                            onChange={(e) =>
                                                filterStore.setStartDate(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <Input
                                            type="date"
                                            placeholder="End Date"
                                            value={filterStore.endDate}
                                            onChange={(e) =>
                                                filterStore.setEndDate(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Contact
                                    </label>
                                    <Combobox
                                        options={CONTACT_OPTIONS}
                                        value={filterStore.filterContact}
                                        onChange={(value) =>
                                            filterStore.setFilterContact(
                                                value || ''
                                            )
                                        }
                                        placeholder="All contacts"
                                        searchPlaceholder="Search contact..."
                                        className="h-9"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Account
                                    </label>
                                    <Combobox
                                        options={ACCOUNT_OPTIONS}
                                        value={filterStore.filterAccountId}
                                        onChange={(value) =>
                                            filterStore.setFilterAccountId(
                                                value || ''
                                            )
                                        }
                                        placeholder="All accounts"
                                        searchPlaceholder="Search account..."
                                        className="h-9"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Amount Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filterStore.filterMinAmount}
                                            onChange={(e) =>
                                                filterStore.setFilterMinAmount(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filterStore.filterMaxAmount}
                                            onChange={(e) =>
                                                filterStore.setFilterMaxAmount(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <DrawerFooter className="border-t border-primary/10">
                                <DrawerClose asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            filterStore.resetFilters()
                                        }
                                    >
                                        Clear All Filters
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>
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
                sortKey={filterStore.sort}
                sortDirection={filterStore.order}
                onSortChange={handleSortChange}
            >
                <TableSelectionToolbar>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkPost}
                        disabled={
                            selectedItems.length === 0 ||
                            isBulkLoading ||
                            postMutation.isPending ||
                            deleteMutation.isPending
                        }
                    >
                        Post Selected
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={
                            selectedItems.length === 0 ||
                            isBulkLoading ||
                            postMutation.isPending ||
                            deleteMutation.isPending
                        }
                    >
                        Delete Selected
                    </Button>
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
                                    variant="default"
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
                                <TableCell onClick={(e) => e.stopPropagation()}>
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
                                        {Number(
                                            entry.totalDebit || 0
                                        ).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </span>
                                </TableCell>
                                <TableCell align="right">
                                    <span className="whitespace-nowrap text-primary">
                                        {Number(
                                            entry.totalCredit || 0
                                        ).toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            entry.isReversing
                                                ? 'warning'
                                                : entry.status === 'draft'
                                                  ? 'secondary'
                                                  : entry.status === 'posted'
                                                    ? 'success'
                                                    : 'destructive'
                                        }
                                    >
                                        {entry.isReversing
                                            ? 'reversed'
                                            : entry.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex items-center gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {entry.status === 'draft' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handlePost(entry)
                                                }
                                                disabled={
                                                    postMutation.isPending
                                                }
                                            >
                                                Post
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    ⋯
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {entry.status === 'draft' && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleEdit(
                                                                    entry.id
                                                                )
                                                            }
                                                            disabled={
                                                                deleteMutation.isPending ||
                                                                postMutation.isPending
                                                            }
                                                        >
                                                            <Icons.Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handlePost(
                                                                    entry
                                                                )
                                                            }
                                                            disabled={
                                                                postMutation.isPending
                                                            }
                                                        >
                                                            Post
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDelete(
                                                                    entry
                                                                )
                                                            }
                                                            disabled={
                                                                deleteMutation.isPending
                                                            }
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Icons.Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {entry.status === 'posted' && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleVoid(
                                                                    entry
                                                                )
                                                            }
                                                            disabled={
                                                                voidMutation.isPending
                                                            }
                                                        >
                                                            Void
                                                        </DropdownMenuItem>
                                                        {!entry.isReversing && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleReverse(
                                                                        entry
                                                                    )
                                                                }
                                                                disabled={
                                                                    reverseMutation.isPending
                                                                }
                                                            >
                                                                <Undo2 className="mr-2 h-4 w-4" />
                                                                Reverse
                                                            </DropdownMenuItem>
                                                        )}
                                                    </>
                                                )}
                                                {entry.status === 'voided' && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleRestore(entry)
                                                        }
                                                        disabled={
                                                            restoreMutation.isPending
                                                        }
                                                    >
                                                        <Redo2 className="mr-2 h-4 w-4" />
                                                        Restore
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
                page={filterStore.page}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={filterStore.limit}
                onPageChange={(page) => filterStore.setPage(page)}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open && !deleteMutation.isPending) {
                        setDeleteDialog({ isOpen: false, entry: null });
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Journal Entry
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete journal entry "
                            {deleteDialog.entry?.entryNumber}"? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                            className={cn(
                                buttonVariants({
                                    variant: 'destructive',
                                })
                            )}
                        >
                            {deleteMutation.isPending
                                ? 'Processing...'
                                : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Post Confirmation Dialog */}
            <AlertDialog
                open={postDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open && !postMutation.isPending) {
                        setPostDialog({ isOpen: false, entry: null });
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Post Journal Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to post journal entry "
                            {postDialog.entry?.entryNumber}"? Posted entries
                            cannot be edited.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={postMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmPost}
                            disabled={postMutation.isPending}
                        >
                            {postMutation.isPending ? 'Processing...' : 'Post'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Void Confirmation Dialog */}
            <AlertDialog
                open={voidDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open && !voidMutation.isPending) {
                        setVoidDialog({ isOpen: false, entry: null });
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Void Journal Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to void journal entry "
                            {voidDialog.entry?.entryNumber}"? This will mark it
                            as voided.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={voidMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmVoid}
                            disabled={voidMutation.isPending}
                            className={cn(
                                buttonVariants({
                                    variant: 'destructive',
                                })
                            )}
                        >
                            {voidMutation.isPending ? 'Processing...' : 'Void'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reverse Confirmation Dialog */}
            <AlertDialog
                open={reverseDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open && !reverseMutation.isPending) {
                        setReverseDialog({ isOpen: false, entry: null });
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Reverse Journal Entry
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reverse journal entry "
                            {reverseDialog.entry?.entryNumber}"? This will
                            create a reversing entry.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <label
                            htmlFor="reversal-date"
                            className="text-sm font-medium text-primary mb-2 block"
                        >
                            Reversal Date *
                        </label>
                        <Input
                            id="reversal-date"
                            type="date"
                            value={reversalDate}
                            onChange={(e) => setReversalDate(e.target.value)}
                            disabled={reverseMutation.isPending}
                            required
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={reverseMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmReverse}
                            disabled={
                                reverseMutation.isPending || !reversalDate
                            }
                        >
                            {reverseMutation.isPending
                                ? 'Processing...'
                                : 'Reverse'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={bulkDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open && !isBulkLoading) {
                        setBulkDialog({ isOpen: false, type: null });
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {bulkDialog.type === 'post'
                                ? `Post ${selectedItems.length} entries`
                                : `Delete ${selectedItems.length} entries`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {bulkDialog.type === 'post'
                                ? 'Only draft entries will be posted.'
                                : 'Only draft entries will be deleted.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBulkLoading}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmBulk}
                            disabled={isBulkLoading}
                            className={cn(
                                buttonVariants({
                                    variant:
                                        bulkDialog.type === 'delete'
                                            ? 'destructive'
                                            : 'default',
                                })
                            )}
                        >
                            {isBulkLoading
                                ? 'Processing...'
                                : bulkDialog.type === 'post'
                                  ? 'Post'
                                  : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
