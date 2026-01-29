import { CreateRuleDrawer } from '@/components/transactions/CreateRuleDrawer';
import { CreateTransactionDrawer } from '@/components/transactions/CreateTransactionDrawer';
import { PostTransactionModal } from '@/components/transactions/PostTransactionModal';
import { SplitTransactionDrawer } from '@/components/transactions/SplitTransactionModal';
import { TransactionHeader } from '@/components/transactions/TransactionHeader';

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Input from '@/components/ui/input';
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
} from '@/components/ui/table';
import { Filter, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { useContacts } from '../../services/apis/contactsApi';
import { useTaxes } from '../../services/apis/taxApi';
import {
    CreateTransactionResponse,
    useReconcileTransaction,
    useReverseTransaction,
    useTransactions,
    useVoidTransaction,
} from '../../services/apis/transactions';
import { useTransactionsFilterStore } from '../../stores/transactions/transactionsFilterStore';
import { showErrorToast, showSuccessToast } from '../../utills/toast';

const Transactionpage = () => {
    type TxStatus = 'pending' | 'posted' | 'voided' | 'reversed';
    type BankTransaction = {
        id: string;
        date: string;
        description: string;
        spent?: number;
        received?: number;
        tax?: number;
        taxId?: string;
        taxRate?: number;
        fromTo?: string;
        category?: string;
        matched?: boolean;
        status: TxStatus;
        account: string;
        accountId?: string;
    };

    const filterStore = useTransactionsFilterStore();
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

    // Select individual filter values to make them reactive
    const page = useTransactionsFilterStore((state) => state.page);
    const limit = useTransactionsFilterStore((state) => state.limit);
    const search = useTransactionsFilterStore((state) => state.search);
    const status = useTransactionsFilterStore((state) => state.status);
    const selectedAccountId = useTransactionsFilterStore(
        (state) => state.selectedAccountId
    );
    const filterStartDate = useTransactionsFilterStore(
        (state) => state.filterStartDate
    );
    const filterEndDate = useTransactionsFilterStore(
        (state) => state.filterEndDate
    );
    const filterSupplier = useTransactionsFilterStore(
        (state) => state.filterSupplier
    );
    const filterCategory = useTransactionsFilterStore(
        (state) => state.filterCategory
    );
    const filterTax = useTransactionsFilterStore((state) => state.filterTax);
    const filterMinAmount = useTransactionsFilterStore(
        (state) => state.filterMinAmount
    );
    const filterMaxAmount = useTransactionsFilterStore(
        (state) => state.filterMaxAmount
    );
    const sort = useTransactionsFilterStore((state) => state.sort);
    const order = useTransactionsFilterStore((state) => state.order);

    const itemsPerPage = limit;

    // Fetch contacts data first (needed for supplier filter conversion)
    const { data: contactsData } = useContacts({
        isActive: true,
        limit: 1000,
    });

    // Fetch chart of accounts for categories
    const { data: accountsData } = useChartOfAccounts({
        isActive: true,
        limit: 1000,
    });

    // Create a map of contactId -> displayName (needed for supplier filter conversion)
    const contactNameById = useMemo(() => {
        const items = contactsData?.data?.items || [];
        const map = new Map<string, string>();
        for (const contact of items) {
            if (contact?.id && contact?.displayName) {
                map.set(contact.id, contact.displayName);
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

        const isDatePattern = (str: string): boolean => {
            // YYYY, YYYY-MM, YYYY-MM-DD, YYYY/MM, YYYY/MM/DD
            const datePattern = /^\d{4}(-|\/)?\d{0,2}(-|\/)?\d{0,2}$/;
            return datePattern.test(str.trim());
        };

        const parseSearchAsDate = (str: string): string | null => {
            const trimmed = str.trim();

            // YYYY-MM-DD or YYYY/MM/DD
            const fullDateMatch = trimmed.match(
                /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
            );
            if (fullDateMatch) {
                const [, year, month, day] = fullDateMatch;
                const date = new Date(
                    `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                );
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }
            // YYYY-MM
            const monthDateMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})$/);
            if (monthDateMatch) {
                const [, year, month] = monthDateMatch;
                const date = new Date(`${year}-${month.padStart(2, '0')}-01`);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }

            // YYYY (search for start of year)
            const yearMatch = trimmed.match(/^(\d{4})$/);
            if (yearMatch) {
                const [, year] = yearMatch;
                const date = new Date(`${year}-01-01`);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }

            return null;
        };
        const trimmedSearch = search?.trim() || '';
        const searchAsNumber = trimmedSearch ? parseFloat(trimmedSearch) : NaN;
        const isNumericSearch =
            !isNaN(searchAsNumber) &&
            isFinite(searchAsNumber) &&
            !isDatePattern(trimmedSearch);

        if (search) {
            if (isDatePattern(trimmedSearch)) {
                const isoDate = parseSearchAsDate(trimmedSearch);
                if (isoDate) {
                    // YYYY or YYYY-MM
                    const fullDateMatch = trimmedSearch.match(
                        /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
                    );
                    if (fullDateMatch) {
                        // Exact date: filter for just that day
                        const searchDate = new Date(isoDate);
                        const startOfDay = new Date(
                            searchDate.getFullYear(),
                            searchDate.getMonth(),
                            searchDate.getDate(),
                            0,
                            0,
                            0,
                            0
                        );
                        const endOfDay = new Date(
                            searchDate.getFullYear(),
                            searchDate.getMonth(),
                            searchDate.getDate(),
                            23,
                            59,
                            59,
                            999
                        );
                        filters.startDate = startOfDay.toISOString();
                        filters.endDate = endOfDay.toISOString();
                    } else {
                        filters.startDate = isoDate;
                    }
                } else {
                    filters.search = search;
                }
            } else if (isNumericSearch) {
                filters.minAmount = searchAsNumber;
                filters.maxAmount = searchAsNumber;
            } else {
                filters.search = search;
            }
        }

        if (status !== 'all') filters.status = status;
        if (selectedAccountId) filters.accountId = selectedAccountId;
        if (filterStartDate) filters.startDate = filterStartDate;
        if (filterEndDate) filters.endDate = filterEndDate;

        // Convert supplier display name to contactId
        if (filterSupplier) {
            // First, try to find contactId by displayName
            const contactId = Array.from(contactNameById.entries()).find(
                ([, name]) => name === filterSupplier
            )?.[0];
            // If found, use contactId; otherwise, check if it's already an ID
            if (contactId) {
                filters.contactId = contactId;
            } else if (contactNameById.has(filterSupplier)) {
                // It's already a contactId
                filters.contactId = filterSupplier;
            }
            // If neither, we might need to handle it differently or skip it
        }

        if (filterCategory) filters.category = filterCategory;
        if (filterTax) filters.taxId = filterTax;

        // Only apply filter drawer min/max if search is not a number
        // (If search is a number, it already set minAmount and maxAmount above)
        if (!isNumericSearch) {
            if (filterMinAmount) {
                const minAmount = parseFloat(filterMinAmount);
                if (!isNaN(minAmount)) filters.minAmount = minAmount;
            }
            if (filterMaxAmount) {
                const maxAmount = parseFloat(filterMaxAmount);
                if (!isNaN(maxAmount)) filters.maxAmount = maxAmount;
            }
        }
        if (sort) {
            // Map UI sort keys to API sort keys
            const sortKeyMap: Record<string, string> = {
                date: 'paidAt',
                spent: 'amount',
                received: 'amount',
                tax: 'amount', // Tax is not directly sortable, use amount as fallback
            };
            const apiSortKey = sortKeyMap[sort] || sort;
            // Only include sort if it's a valid API sort key
            const validApiSortKeys = [
                'paidAt',
                'amount',
                'type',
                'reconciled',
                'createdAt',
                'updatedAt',
            ];
            if (validApiSortKeys.includes(apiSortKey)) {
                filters.sort = apiSortKey;
                filters.order = order;
            }
        }

        return filters;
    }, [
        page,
        limit,
        search,
        status,
        selectedAccountId,
        filterStartDate,
        filterEndDate,
        filterSupplier,
        filterCategory,
        filterTax,
        filterMinAmount,
        filterMaxAmount,
        sort,
        order,
        contactNameById,
    ]);

    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const { data: apiResponse, isLoading, error } = useTransactions(apiFilters);
    const apiTransactions = useMemo(
        () => apiResponse?.items || [],
        [apiResponse?.items]
    );
    const pagination = apiResponse?.pagination;

    // Helper function to get transaction status (consistent mapping)
    const getTransactionStatus = useCallback(
        (tx: { reconciled?: boolean; status?: string }): TxStatus => {
            if (!tx) return 'pending';
            // Map API 'draft' status back to 'pending' for UI
            const apiStatus = (tx as unknown as { status?: string }).status;
            if (apiStatus === 'draft') {
                return 'pending';
            }
            // Map other statuses or use reconciled flag
            return (
                (apiStatus as TxStatus) ||
                (tx.reconciled ? 'posted' : 'pending')
            );
        },
        []
    );

    // Fetch all transactions (without status filter) for accurate counts on bank cards
    const countFilters = useMemo(() => {
        const filters: Record<string, unknown> = {
            limit: 1000, // Get a large number to count all
        };
        if (selectedAccountId) filters.accountId = selectedAccountId;
        // Don't include status filter - we want all statuses for counting
        return filters;
    }, [selectedAccountId]);
    const { data: allTransactionsResponse } = useTransactions(countFilters);
    const allTransactions = allTransactionsResponse?.items || [];
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [postModalOpen, setPostModalOpen] = useState(false);
    const [selectedTransactionForPost, setSelectedTransactionForPost] =
        useState<string | null>(null);
    const [splitModalOpen, setSplitModalOpen] = useState(false);
    const [selectedTransactionForSplit, setSelectedTransactionForSplit] =
        useState<{
            id: string;
            amount: number;
            category?: string;
            taxId?: string;
            description?: string;
        } | null>(null);
    const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);
    const [selectedTransactionForRule, setSelectedTransactionForRule] =
        useState<BankTransaction | null>(null);
    const {
        mutate: reconcileTransaction,
        mutateAsync: reconcileTransactionAsync,
    } = useReconcileTransaction();
    const { mutate: voidTransaction, mutateAsync: voidTransactionAsync } =
        useVoidTransaction();
    const { mutate: reverseTransaction, mutateAsync: reverseTransactionAsync } =
        useReverseTransaction();

    const handleBulkAction = async (
        actionName: string,
        actionFn: (id: string) => Promise<CreateTransactionResponse>
    ) => {
        if (!selectedItems.length) return;
        setIsBulkProcessing(true);
        const count = selectedItems.length;
        try {
            await Promise.all(selectedItems.map((id) => actionFn(String(id))));
            showSuccessToast(
                `${count} transactions ${actionName} successfully`
            );
            setSelectedItems([]);
        } catch (error) {
            console.error(`Failed to ${actionName} transactions:`, error);
            showErrorToast(`Failed to ${actionName} some transactions`);
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkPost = () => {
        // For bulk post, show modal for first transaction
        // User will need to post them individually or we can enhance this later
        if (selectedItems.length === 0) return;
        const firstTxId = selectedItems[0] as string;
        setSelectedTransactionForPost(firstTxId);
        setPostModalOpen(true);
    };

    useEffect(() => {
        if (isLoading) return;
        if (error) {
            console.error('Error fetching transactions:', error);
            showErrorToast('Failed to fetch transactions');
            return;
        }
        if (!apiTransactions) {
            return;
        }

        const mapped: BankTransaction[] = apiTransactions.map((tx) => {
            const date = tx.paidAt || tx.createdAt;
            const description = tx.description || 'Transaction';
            const rawAmount = parseFloat(tx.amount || '0');

            // Determine spent vs received based on transaction type
            let spent: number | undefined;
            let received: number | undefined;

            if (tx.type === 'expense') {
                spent = rawAmount;
            } else if (tx.type === 'income') {
                received = rawAmount;
            } else {
                // For transfers, it depends on context, but let's default to spent for now or handle as needed
                spent = rawAmount;
            }

            const account = tx.account?.accountName || 'Account';
            const accountId = tx.accountId;

            // --------- Extract IDs from API response (top-level or split) ---------
            // NOTE: the TransactionItem type in `src/types/index.ts` doesn't include
            // category/tax at top-level, but the API may return them. We read
            // defensively from common locations.
            const firstSplit = tx.splits?.[0];

            // Contact
            const contactId =
                (tx as unknown as { contactId?: string | null }).contactId ??
                undefined;

            // Category (prefer backend id if present; fallback to split categoryId)
            const categoryIdCandidate =
                (tx as unknown as { categoryId?: string | null }).categoryId ??
                (firstSplit as unknown as { categoryId?: string | null })
                    ?.categoryId ??
                undefined;

            // Some backends expose a nested category object or category+gifi label.
            const categoryLabelCandidate =
                (firstSplit?.categoryAndGifi?.[0]?.displayLabel as
                    | string
                    | undefined) ?? undefined;

            // Tax (prefer explicit taxId/taxIds; fallback to split)
            const taxIdCandidate =
                (tx as unknown as { taxId?: string | null }).taxId ??
                (
                    tx as unknown as {
                        taxIds?: Array<string | null | undefined>;
                    }
                ).taxIds?.find((id) => !!id) ??
                (firstSplit as unknown as { taxId?: string | null })?.taxId ??
                (
                    firstSplit as unknown as {
                        taxIds?: Array<string | null | undefined>;
                    }
                )?.taxIds?.find((id) => !!id) ??
                undefined;

            // Map reconciled: false -> 'pending' (waiting for reconciliation/review)
            // Map reconciled: true -> 'posted' (finalized)
            // If API returns explicit status, use it
            const status: TxStatus = getTransactionStatus(tx);

            return {
                id: tx.id,
                date,
                description,
                spent,
                received,
                tax: undefined,
                // Keep id as-is if API provides it; default tax assignment happens later.
                taxId: taxIdCandidate || undefined,
                taxRate: undefined,
                // Store contactId (UI maps it to displayName via `contactNameById`)
                fromTo: contactId || undefined,
                // Store categoryId if available; otherwise fallback to label (so UI shows *something*)
                category:
                    categoryIdCandidate || categoryLabelCandidate || undefined,
                matched: tx.reconciled,
                status,
                account,
                accountId,
            };
        });

        setTransactions(mapped);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiTransactions, isLoading, error]);

    // Supplier/From-To options from actual contacts API
    const SUPPLIER_OPTIONS: ComboboxOption[] = useMemo(() => {
        const contacts = contactsData?.data?.items || [];
        return contacts
            .filter((contact) => contact.displayName)
            .map((contact) => ({
                value: contact.displayName,
                label: contact.displayName,
            }));
    }, [contactsData]);
    // Category options from Chart of Accounts (expense and income accounts)
    const CATEGORY_OPTIONS: ComboboxOption[] = useMemo(() => {
        const accounts = accountsData?.data?.items || [];
        const categories = accounts.filter(
            (acc) =>
                acc.accountType === 'expense' || acc.accountType === 'income'
        );
        return categories.map((account) => ({
            value: account.id,
            label: account.accountName,
        }));
    }, [accountsData]);

    // Use API data directly - all filtering is handled by the API
    const filtered = transactions;

    // Calculate counts from all transactions (not filtered) for accurate status tab counts
    const pendingCount = allTransactions.filter(
        (tx) => getTransactionStatus(tx) === 'pending'
    ).length;
    const postedCount = allTransactions.filter(
        (tx) => getTransactionStatus(tx) === 'posted'
    ).length;
    const allCount = allTransactions.length;

    const { data: taxesResponse } = useTaxes({ isActive: true, limit: 100 });
    const TAX_OPTIONS: ComboboxOption[] = useMemo(() => {
        const taxes = taxesResponse?.data?.items || [];
        return taxes.map((t) => ({
            value: t.id,
            label: `${t.name} (${(t.rate * 100).toFixed(2)}%)`,
        }));
    }, [taxesResponse]);
    const TAX_RATE_BY_ID: Record<string, number> = useMemo(() => {
        const taxes = taxesResponse?.data?.items || [];
        const map: Record<string, number> = {};
        taxes.forEach((t) => {
            map[t.id] = t.rate;
        });
        return map;
    }, [taxesResponse]);
    useEffect(() => {
        const defaultTax =
            taxesResponse?.data?.items?.find((t) => t.isActive) ||
            taxesResponse?.data?.items?.[0];
        if (!defaultTax) return;
        setTransactions((prev) =>
            prev.map((tx) => {
                // Only auto-assign a default tax if API didn't provide one.
                if (!tx.taxId && tx.spent) {
                    const rate = defaultTax.rate;
                    const taxAmount = Number((tx.spent * rate).toFixed(2));
                    return {
                        ...tx,
                        taxId: defaultTax.id,
                        taxRate: rate,
                        tax: taxAmount,
                    };
                }
                return tx;
            })
        );
    }, [taxesResponse]);

    // No client-side sorting or pagination - API handles it
    // API returns paginated results, so use them directly
    const pageData = filtered;

    // Calculate total pages from API pagination metadata if available
    const totalPages =
        pagination?.totalPages ||
        Math.ceil((pagination?.total || filtered.length) / itemsPerPage) ||
        1;
    const totalItems = pagination?.total || filtered.length;

    const currency = (n?: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(n || 0);

    return (
        <div className="flex flex-col gap-4">
            <TransactionHeader
                selectedAccountId={filterStore.selectedAccountId}
                onAccountSelect={(id) => filterStore.setSelectedAccountId(id)}
                transactions={allTransactions.map((tx) => {
                    const date = tx.paidAt || tx.createdAt;
                    const status: TxStatus = getTransactionStatus(tx);
                    return {
                        accountId: tx.accountId,
                        status,
                        date,
                    };
                })}
                onStatusSelect={(status) => filterStore.setStatus(status)}
                currentStatus={status}
            />

            <div className="flex items-center gap-2 flex-wrap">
                <Tabs
                    value={
                        status === 'pending'
                            ? 'draft'
                            : status === 'all'
                              ? 'all'
                              : status === 'posted'
                                ? 'posted'
                                : 'all'
                    }
                    onValueChange={(value) => {
                        if (value === 'draft') {
                            filterStore.setStatus('pending');
                        } else if (value === 'all') {
                            filterStore.setStatus('all');
                        } else if (value === 'posted') {
                            filterStore.setStatus('posted');
                        }
                    }}
                    className="w-fit"
                >
                    <TabsList>
                        <TabsTrigger value="all">All ({allCount})</TabsTrigger>
                        <TabsTrigger value="draft">
                            Draft ({pendingCount})
                        </TabsTrigger>
                        <TabsTrigger value="posted">
                            Posted ({postedCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="sm:ml-auto flex items-center gap-3 flex-wrap">
                    <div className="relative w-full sm:w-[260px]">
                        <Input
                            value={filterStore.search}
                            onChange={(e) =>
                                filterStore.setSearch(e.target.value)
                            }
                            placeholder="Search"
                            startIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <CreateTransactionDrawer
                        selectedAccountId={selectedAccountId}
                    />
                    <Drawer
                        open={isFilterDrawerOpen}
                        onOpenChange={setIsFilterDrawerOpen}
                        direction="right"
                    >
                        <DrawerTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-initial"
                            >
                                <Filter className="mr-2 h-4 w-4" /> Filters
                                {(filterStore.filterSupplier ||
                                    filterStore.filterCategory ||
                                    filterStore.filterTax ||
                                    filterStore.filterStartDate ||
                                    filterStore.filterEndDate ||
                                    filterStore.filterMinAmount ||
                                    filterStore.filterMaxAmount) && (
                                    <span className="ml-2 h-2 w-2 rounded-full bg-accent" />
                                )}
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="h-full w-full sm:w-[400px]">
                            <DrawerHeader className="border-b border-primary/10">
                                <div className="flex items-center justify-between">
                                    <DrawerTitle>
                                        Filter Transactions
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
                                        Date Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="date"
                                            placeholder="Start Date"
                                            value={filterStore.filterStartDate}
                                            onChange={(e) =>
                                                filterStore.setFilterStartDate(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <Input
                                            type="date"
                                            placeholder="End Date"
                                            value={filterStore.filterEndDate}
                                            onChange={(e) =>
                                                filterStore.setFilterEndDate(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Supplier
                                    </label>
                                    <Combobox
                                        options={SUPPLIER_OPTIONS}
                                        value={filterStore.filterSupplier}
                                        onChange={(value) =>
                                            filterStore.setFilterSupplier(
                                                value || ''
                                            )
                                        }
                                        placeholder="All suppliers"
                                        searchPlaceholder="Search supplier..."
                                        className="h-9"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Category
                                    </label>
                                    <Combobox
                                        options={CATEGORY_OPTIONS}
                                        value={filterStore.filterCategory}
                                        onChange={(value) =>
                                            filterStore.setFilterCategory(
                                                value || ''
                                            )
                                        }
                                        placeholder="All categories"
                                        searchPlaceholder="Search category..."
                                        className="h-9"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-primary/70 mb-2 block">
                                        Tax
                                    </label>
                                    <Combobox
                                        options={TAX_OPTIONS}
                                        value={filterStore.filterTax}
                                        onChange={(value) =>
                                            filterStore.setFilterTax(
                                                value || ''
                                            )
                                        }
                                        placeholder="All taxes"
                                        searchPlaceholder="Search tax..."
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

            <Table
                enableSelection={true}
                onSelectionChange={setSelectedItems}
                rowIds={pageData.map((t) => t.id)}
                selectedIds={selectedItems}
                sortKey={filterStore.sort}
                sortDirection={filterStore.order}
                onSortChange={(key, direction) => {
                    filterStore.setSort(
                        direction ? key : null,
                        direction || undefined
                    );
                }}
                transposeOnMobile
            >
                {/* Bulk Actions Toolbar */}
                <TableSelectionToolbar>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            className="border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-900 "
                            onClick={handleBulkPost}
                        >
                            Post ({selectedItems.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 "
                            onClick={() =>
                                handleBulkAction(
                                    'reconciled',
                                    reconcileTransactionAsync
                                )
                            }
                        >
                            Reconcile ({selectedItems.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            className="border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-900 "
                            onClick={() =>
                                handleBulkAction(
                                    'reversed',
                                    reverseTransactionAsync
                                )
                            }
                        >
                            Reverse ({selectedItems.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isBulkProcessing}
                            className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-900 "
                            onClick={() =>
                                handleBulkAction('voided', voidTransactionAsync)
                            }
                        >
                            Void ({selectedItems.length})
                        </Button>
                    </div>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="date">
                            Date
                        </TableHead>
                        <TableHead>Bank Description</TableHead>
                        <TableHead sortable sortKey="spent">
                            Spent
                        </TableHead>
                        <TableHead sortable sortKey="received">
                            Received
                        </TableHead>
                        <TableHead sortable sortKey="tax">
                            Tax
                        </TableHead>
                        <TableHead>From/To</TableHead>
                        <TableHead>Match/Categorize</TableHead>
                        <TableHead>Action</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {pageData.length === 0 ? (
                        <TableEmptyState
                            colSpan={9}
                            message="No transactions found"
                            description="Try adjusting your filters or add new transactions."
                        />
                    ) : (
                        pageData.map((t) => (
                            <TableRow key={t.id} rowId={t.id}>
                                <TableCell data-label="">
                                    <TableRowCheckbox rowId={t.id} />
                                </TableCell>
                                <TableCell data-label="Date">
                                    <span className="text-sm font-medium text-primary">
                                        {new Date(t.date).toLocaleDateString()}
                                    </span>
                                </TableCell>
                                <TableCell
                                    data-label="Bank Description"
                                    noTruncate
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-primary">
                                            {t.description}
                                        </span>
                                        <span className="text-xs text-primary/50">
                                            {t.account}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell data-label="Spent">
                                    <span className="text-red-600 font-semibold">
                                        {t.spent ? `-${currency(t.spent)}` : ''}
                                    </span>
                                </TableCell>
                                <TableCell data-label="Received">
                                    <span className="text-green-600 font-semibold">
                                        {t.received
                                            ? `+${currency(t.received)}`
                                            : ''}
                                    </span>
                                </TableCell>
                                <TableCell data-label="Tax" noTruncate>
                                    <div className="flex items-center gap-3">
                                        <div className="min-w-[200px]">
                                            <Combobox
                                                options={TAX_OPTIONS}
                                                value={t.taxId || ''}
                                                onChange={(value) => {
                                                    const rate =
                                                        (value &&
                                                            TAX_RATE_BY_ID[
                                                                value
                                                            ]) ||
                                                        0;
                                                    setTransactions((prev) =>
                                                        prev.map((tx) => {
                                                            if (tx.id !== t.id)
                                                                return tx;
                                                            const base =
                                                                tx.spent ?? 0;
                                                            const taxAmount =
                                                                Number(
                                                                    (
                                                                        base *
                                                                        rate
                                                                    ).toFixed(2)
                                                                );
                                                            return {
                                                                ...tx,
                                                                taxId:
                                                                    value ||
                                                                    undefined,
                                                                taxRate:
                                                                    rate ||
                                                                    undefined,
                                                                tax: taxAmount,
                                                            };
                                                        })
                                                    );
                                                }}
                                                placeholder="Select tax..."
                                                searchPlaceholder="Search tax..."
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell data-label="From/To" noTruncate>
                                    <div className="min-w-[200px]">
                                        <Combobox
                                            options={SUPPLIER_OPTIONS}
                                            value={
                                                t.fromTo
                                                    ? contactNameById.get(
                                                          t.fromTo
                                                      ) || t.fromTo
                                                    : ''
                                            }
                                            onChange={(value) => {
                                                // Find contactId by displayName
                                                const contactId =
                                                    Array.from(
                                                        contactNameById.entries()
                                                    ).find(
                                                        ([, name]) =>
                                                            name === value
                                                    )?.[0] || value;

                                                setTransactions((prev) =>
                                                    prev.map((tx) =>
                                                        tx.id === t.id
                                                            ? {
                                                                  ...tx,
                                                                  fromTo:
                                                                      contactId ||
                                                                      undefined,
                                                              }
                                                            : tx
                                                    )
                                                );
                                            }}
                                            placeholder="Select supplier..."
                                            searchPlaceholder="Search supplier..."
                                            className="h-8"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell
                                    data-label="Match/Categorize"
                                    noTruncate
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="min-w-[220px]">
                                            <Combobox
                                                options={CATEGORY_OPTIONS}
                                                value={t.category || ''}
                                                onChange={(value) => {
                                                    // Find category name by ID
                                                    const categoryName =
                                                        CATEGORY_OPTIONS.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                value
                                                        )?.label || value;

                                                    setTransactions((prev) =>
                                                        prev.map((tx) =>
                                                            tx.id === t.id
                                                                ? {
                                                                      ...tx,
                                                                      category:
                                                                          value ||
                                                                          undefined,
                                                                  }
                                                                : tx
                                                        )
                                                    );
                                                    if (value) {
                                                        showSuccessToast(
                                                            `Category set to ${categoryName}`
                                                        );
                                                    }
                                                }}
                                                placeholder="Select category..."
                                                searchPlaceholder="Search category..."
                                                className="h-8"
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setTransactions((prev) =>
                                                    prev.map((tx) =>
                                                        tx.id === t.id
                                                            ? {
                                                                  ...tx,
                                                                  matched:
                                                                      !tx.matched,
                                                              }
                                                            : tx
                                                    )
                                                );
                                                showSuccessToast(
                                                    t.matched
                                                        ? 'Unmatched'
                                                        : 'Matched'
                                                );
                                            }}
                                        >
                                            {t.matched ? 'Matched' : 'Match'}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell data-label="Action" noTruncate>
                                    <div className="flex items-center gap-2">
                                        {t.status === 'pending' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTransactionForPost(
                                                        t.id
                                                    );
                                                    setPostModalOpen(true);
                                                }}
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
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        showSuccessToast(
                                                            'Update coming soon'
                                                        )
                                                    }
                                                >
                                                    Update
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        reconcileTransaction(
                                                            t.id
                                                        )
                                                    }
                                                >
                                                    Reconcile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        voidTransaction(t.id)
                                                    }
                                                >
                                                    Void
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        reverseTransaction(t.id)
                                                    }
                                                >
                                                    Reverse
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        // Get the absolute amount (spent or received)
                                                        const transactionAmount =
                                                            Math.abs(
                                                                t.spent ||
                                                                    t.received ||
                                                                    0
                                                            );
                                                        setSelectedTransactionForSplit(
                                                            {
                                                                id: t.id,
                                                                amount: transactionAmount,
                                                                category:
                                                                    t.category,
                                                                taxId: t.taxId,
                                                                description:
                                                                    t.description,
                                                            }
                                                        );
                                                        setSplitModalOpen(true);
                                                    }}
                                                >
                                                    Split
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedTransactionForRule(
                                                            t
                                                        );
                                                        setRuleDrawerOpen(true);
                                                    }}
                                                >
                                                    Create rule
                                                </DropdownMenuItem>
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
            {totalPages > 1 && (
                <TablePagination
                    page={filterStore.page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => filterStore.setPage(page)}
                    className="mr-[25px]"
                />
            )}

            {/* Post Transaction Modal */}
            {selectedTransactionForPost && (
                <PostTransactionModal
                    open={postModalOpen}
                    onOpenChange={(open) => {
                        setPostModalOpen(open);
                        if (!open) {
                            // If there are more selected items, open modal for next one
                            const remaining = selectedItems.filter(
                                (id) => id !== selectedTransactionForPost
                            );
                            if (remaining.length > 0) {
                                setSelectedTransactionForPost(
                                    remaining[0] as string
                                );
                                setPostModalOpen(true);
                            } else {
                                setSelectedTransactionForPost(null);
                                setSelectedItems([]);
                            }
                        }
                    }}
                    transactionId={selectedTransactionForPost}
                    transactionDate={
                        transactions.find(
                            (t) => t.id === selectedTransactionForPost
                        )?.date
                    }
                    defaultCounterAccountId={
                        transactions.find(
                            (t) => t.id === selectedTransactionForPost
                        )?.accountId
                    }
                    onSuccess={() => {
                        // Remove posted transaction from selected items
                        setSelectedItems((prev) =>
                            prev.filter(
                                (id) => id !== selectedTransactionForPost
                            )
                        );
                    }}
                />
            )}

            {/* Split Transaction Drawer */}
            {selectedTransactionForSplit && (
                <SplitTransactionDrawer
                    open={splitModalOpen}
                    onOpenChange={(open) => {
                        setSplitModalOpen(open);
                        if (!open) {
                            setSelectedTransactionForSplit(null);
                        }
                    }}
                    transactionId={selectedTransactionForSplit.id}
                    transactionAmount={selectedTransactionForSplit.amount}
                    transactionCategoryId={selectedTransactionForSplit.category}
                    transactionTaxId={selectedTransactionForSplit.taxId}
                    transactionDescription={
                        selectedTransactionForSplit.description
                    }
                    onSuccess={() => {
                        setSelectedTransactionForSplit(null);
                    }}
                />
            )}

            {/* Create Rule Drawer */}
            {selectedTransactionForRule && (
                <CreateRuleDrawer
                    open={ruleDrawerOpen}
                    onOpenChange={(open) => {
                        setRuleDrawerOpen(open);
                        if (!open) {
                            setSelectedTransactionForRule(null);
                        }
                    }}
                    transaction={{
                        id: selectedTransactionForRule.id,
                        description: selectedTransactionForRule.description,
                        spent: selectedTransactionForRule.spent,
                        received: selectedTransactionForRule.received,
                        category: selectedTransactionForRule.category,
                        fromTo: selectedTransactionForRule.fromTo,
                        accountId: selectedTransactionForRule.accountId,
                        taxId: selectedTransactionForRule.taxId,
                    }}
                />
            )}
        </div>
    );
};

export default Transactionpage;
