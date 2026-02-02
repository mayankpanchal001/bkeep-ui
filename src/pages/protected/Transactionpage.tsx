import { CreateRuleDrawer } from '@/components/transactions/CreateRuleDrawer';
import { PostTransactionModal } from '@/components/transactions/PostTransactionModal';
import { SplitTransactionDrawer } from '@/components/transactions/SplitTransactionModal';
import { TransactionHeader } from '@/components/transactions/TransactionHeader';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';

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
import Input from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    buildApiFilters,
    buildCategoryOptions,
    buildContactNameMap,
    buildSupplierOptions,
    buildTaxOptions,
    computeCounts,
    getTransactionStatus,
    mapApiTransactionsToBank,
    type BankTransaction,
    type TxStatus,
} from '@/utils/transactionUtils';
import { Filter, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { useContacts } from '../../services/apis/contactsApi';
import { useTaxes } from '../../services/apis/taxApi';
import {
    useReconcileTransaction,
    useReverseTransaction,
    useTransactions,
    useUpdateTransaction,
    useVoidTransaction,
} from '../../services/apis/transactions';
import { useTransactionsFilterStore } from '../../stores/transactions/transactionsFilterStore';
import { showErrorToast, showSuccessToast } from '../../utills/toast';

const Transactionpage = () => {
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

    const contactNameById = useMemo(
        () => buildContactNameMap(contactsData),
        [contactsData]
    );

    const apiFilters = useMemo(
        () =>
            buildApiFilters({
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
                contactsData,
            }),
        [
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
            contactsData,
        ]
    );

    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const { data: apiResponse, isLoading, error } = useTransactions(apiFilters);
    const apiTransactions = useMemo(
        () => apiResponse?.items || [],
        [apiResponse?.items]
    );
    const pagination = apiResponse?.pagination;

    const getTransactionStatusRef = useCallback(getTransactionStatus, []);

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
    const { mutate: updateTransaction } = useUpdateTransaction();

    const handleBulkAction = async (
        actionName: string,
        actionFn: (id: string) => Promise<unknown>
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
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                `Failed to ${actionName} some transactions`;
            showErrorToast(message);
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
        if (status === 'all') {
            filterStore.setStatus('pending');
        }
    }, [status, filterStore]);

    useEffect(() => {
        if (isLoading) return;
        if (error) {
            console.error('Error fetching transactions:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to fetch transactions';
            showErrorToast(message);
            return;
        }
        if (!apiTransactions) {
            return;
        }
        const mapped: BankTransaction[] =
            mapApiTransactionsToBank(apiTransactions);
        setTransactions(mapped);
    }, [apiTransactions, isLoading, error]);

    const SUPPLIER_OPTIONS: ComboboxOption[] = useMemo(
        () => buildSupplierOptions(contactsData),
        [contactsData]
    );
    const CATEGORY_OPTIONS: ComboboxOption[] = useMemo(
        () => buildCategoryOptions(accountsData),
        [accountsData]
    );

    // Use API data directly - all filtering is handled by the API
    const filtered = transactions;

    // Calculate counts from all transactions (not filtered) for accurate status tab counts

    const { data: taxesResponse } = useTaxes({ isActive: true, limit: 100 });
    const { options: TAX_OPTIONS, rateById: TAX_RATE_BY_ID } = useMemo(
        () => buildTaxOptions(taxesResponse),
        [taxesResponse]
    );

    // No client-side sorting or pagination - API handles it
    // API returns paginated results, so use them directly
    const pageData = filtered;

    const totalPages =
        pagination?.totalPages ||
        Math.ceil((pagination?.total || filtered.length) / itemsPerPage) ||
        1;
    const totalItems = pagination?.total || filtered.length;

    const getStatusForHeader = getTransactionStatusRef;

    return (
        <div className="flex flex-col gap-4">
            <TransactionHeader
                selectedAccountId={filterStore.selectedAccountId}
                onAccountSelect={(id) => filterStore.setSelectedAccountId(id)}
                transactions={allTransactions.map((tx) => {
                    const date = tx.paidAt || tx.createdAt;
                    const status: TxStatus = getStatusForHeader(tx);
                    return { accountId: tx.accountId, status, date };
                })}
                onStatusSelect={(status) => filterStore.setStatus(status)}
                currentStatus={status}
            />

            <div className="flex items-center gap-2 flex-wrap">
                <Tabs
                    value={
                        status === 'posted'
                            ? 'posted'
                            : status === 'voided'
                              ? 'excluded'
                              : 'pending'
                    }
                    onValueChange={(value) => {
                        if (value === 'pending') {
                            filterStore.setStatus('pending');
                        } else if (value === 'posted') {
                            filterStore.setStatus('posted');
                        } else if (value === 'excluded') {
                            filterStore.setStatus('voided');
                        }
                    }}
                    className="w-fit"
                >
                    <TabsList>
                        <TabsTrigger value="pending">
                            Pending (
                            {computeCounts(allTransactions).pendingCount})
                        </TabsTrigger>
                        <TabsTrigger value="posted">
                            Posted ({computeCounts(allTransactions).postedCount}
                            )
                        </TabsTrigger>
                        <TabsTrigger value="excluded">
                            Excluded (
                            {computeCounts(allTransactions).excludedCount})
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

            <TransactionsTable
                data={pageData}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                sort={filterStore.sort}
                order={filterStore.order}
                onSortChange={(key, direction) => {
                    filterStore.setSort(
                        direction ? key : null,
                        direction || undefined
                    );
                }}
                isBulkProcessing={isBulkProcessing}
                handleBulkPost={handleBulkPost}
                handleBulkAction={handleBulkAction}
                reconcileTransactionAsync={reconcileTransactionAsync}
                reverseTransactionAsync={reverseTransactionAsync}
                voidTransactionAsync={voidTransactionAsync}
                supplierOptions={SUPPLIER_OPTIONS}
                categoryOptions={CATEGORY_OPTIONS}
                taxOptions={TAX_OPTIONS}
                taxRateById={TAX_RATE_BY_ID}
                contactNameById={contactNameById}
                updateTransaction={updateTransaction}
                setTransactions={setTransactions}
                onSplitClick={(t) => {
                    const transactionAmount = Math.abs(
                        t.spent || t.received || 0
                    );
                    setSelectedTransactionForSplit({
                        id: t.id,
                        amount: transactionAmount,
                        category: t.category,
                        taxId: t.taxId,
                        description: t.description,
                    });
                    setSplitModalOpen(true);
                }}
                onCreateRuleClick={(t) => {
                    setSelectedTransactionForRule(t);
                    setRuleDrawerOpen(true);
                }}
                reconcileTransaction={(id) => reconcileTransaction(id)}
                voidTransaction={(id) => voidTransaction(id)}
                reverseTransaction={(id) => reverseTransaction(id)}
                pagination={{
                    page: filterStore.page,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: itemsPerPage,
                    onPageChange: (page) => filterStore.setPage(page),
                }}
            />

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
                        fromTo:
                            selectedTransactionForRule.contactId ||
                            selectedTransactionForRule.fromTo,
                        accountId: selectedTransactionForRule.accountId,
                        taxId: selectedTransactionForRule.taxId,
                    }}
                />
            )}
        </div>
    );
};

export default Transactionpage;
