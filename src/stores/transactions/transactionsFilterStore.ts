import { create } from 'zustand';

type SortDirection = 'asc' | 'desc';

export type TransactionsFilterState = {
    // Pagination
    page: number;
    limit: number;

    // Filters
    search: string;
    status: 'pending' | 'posted' | 'voided' | 'reversed' | 'all';
    selectedAccountId: string | undefined;
    filterSupplier: string;
    filterCategory: string;
    filterTax: string;
    filterStartDate: string;
    filterEndDate: string;
    filterMinAmount: string;
    filterMaxAmount: string;

    // Sorting
    sort: string | null;
    order: SortDirection;

    // Actions
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSearch: (search: string) => void;
    setStatus: (
        status: 'pending' | 'posted' | 'voided' | 'reversed' | 'all'
    ) => void;
    setSelectedAccountId: (accountId: string | undefined) => void;
    setFilterSupplier: (supplier: string) => void;
    setFilterCategory: (category: string) => void;
    setFilterTax: (tax: string) => void;
    setFilterStartDate: (date: string) => void;
    setFilterEndDate: (date: string) => void;
    setFilterMinAmount: (amount: string) => void;
    setFilterMaxAmount: (amount: string) => void;
    setSort: (sort: string | null, order?: SortDirection) => void;
    resetFilters: () => void;

    // Get API filters
    getApiFilters: () => Record<string, unknown>;
};

const initialState = {
    page: 1,
    limit: 20,
    search: '',
    status: 'all' as const,
    selectedAccountId: undefined as string | undefined,
    filterSupplier: '',
    filterCategory: '',
    filterTax: '',
    filterStartDate: '',
    filterEndDate: '',
    filterMinAmount: '',
    filterMaxAmount: '',
    sort: 'date' as string | null,
    order: 'asc' as SortDirection,
};

export const useTransactionsFilterStore = create<TransactionsFilterState>(
    (set, get) => ({
        ...initialState,

        setPage: (page) => set({ page }),
        setLimit: (limit) => set({ limit }),
        setSearch: (search) => set({ search, page: 1 }),
        setStatus: (status) => set({ status, page: 1 }),
        setSelectedAccountId: (accountId) =>
            set({ selectedAccountId: accountId, page: 1 }),
        setFilterSupplier: (supplier) =>
            set({ filterSupplier: supplier, page: 1 }),
        setFilterCategory: (category) =>
            set({ filterCategory: category, page: 1 }),
        setFilterTax: (tax) => set({ filterTax: tax, page: 1 }),
        setFilterStartDate: (date) => set({ filterStartDate: date, page: 1 }),
        setFilterEndDate: (date) => set({ filterEndDate: date, page: 1 }),
        setFilterMinAmount: (amount) =>
            set({ filterMinAmount: amount, page: 1 }),
        setFilterMaxAmount: (amount) =>
            set({ filterMaxAmount: amount, page: 1 }),
        setSort: (sort, order) => {
            const currentOrder = get().order;
            const newOrder =
                order ||
                (get().sort === sort && currentOrder === 'asc'
                    ? 'desc'
                    : 'asc');
            set({ sort, order: newOrder, page: 1 });
        },
        resetFilters: () => set(initialState),

        getApiFilters: () => {
            const state = get();
            const filters: Record<string, unknown> = {
                page: state.page,
                limit: state.limit,
            };

            if (state.search) filters.search = state.search;
            if (state.status !== 'all') filters.status = state.status;
            if (state.selectedAccountId)
                filters.accountId = state.selectedAccountId;
            if (state.filterStartDate)
                filters.startDate = state.filterStartDate;
            if (state.filterEndDate) filters.endDate = state.filterEndDate;
            if (state.filterSupplier) filters.contactId = state.filterSupplier;
            if (state.filterCategory) filters.category = state.filterCategory;
            if (state.filterTax) filters.taxId = state.filterTax;
            if (state.filterMinAmount) {
                const minAmount = parseFloat(state.filterMinAmount);
                if (!isNaN(minAmount)) filters.minAmount = minAmount;
            }
            if (state.filterMaxAmount) {
                const maxAmount = parseFloat(state.filterMaxAmount);
                if (!isNaN(maxAmount)) filters.maxAmount = maxAmount;
            }
            if (state.sort) {
                filters.sort = state.sort;
                filters.order = state.order;
            }

            return filters;
        },
    })
);
