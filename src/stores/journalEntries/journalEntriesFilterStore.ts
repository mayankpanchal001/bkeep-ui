import { create } from 'zustand';
import type { JournalEntryFilters } from '../../types/journal';

type SortDirection = 'asc' | 'desc';

export type JournalEntriesFilterState = {
    // Pagination
    page: number;
    limit: number;

    // Filters
    search: string;
    status: 'draft' | 'posted' | 'voided' | 'all';
    startDate: string;
    endDate: string;
    filterContact: string; // Contact/Supplier filter (display name)
    filterAccountId: string; // Account filter
    filterMinAmount: string; // Min amount filter
    filterMaxAmount: string; // Max amount filter

    // Sorting
    sort: string | null;
    order: SortDirection;

    // Actions
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSearch: (search: string) => void;
    setStatus: (status: 'draft' | 'posted' | 'voided' | 'all') => void;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    setFilterContact: (contact: string) => void;
    setFilterAccountId: (accountId: string) => void;
    setFilterMinAmount: (amount: string) => void;
    setFilterMaxAmount: (amount: string) => void;
    setSort: (sort: string | null, order?: SortDirection) => void;
    setSortOrder: (order: SortDirection) => void;
    resetFilters: () => void;

    // Get API filters
    getApiFilters: () => JournalEntryFilters & {
        sort?: string;
        order?: SortDirection;
    };
};

const initialState = {
    page: 1,
    limit: 20,
    search: '',
    status: 'all' as const,
    startDate: '',
    endDate: '',
    filterContact: '',
    filterAccountId: '',
    filterMinAmount: '',
    filterMaxAmount: '',
    sort: 'entryDate' as string | null,
    order: 'desc' as SortDirection,
};

export const useJournalEntriesFilterStore = create<JournalEntriesFilterState>(
    (set, get) => ({
        ...initialState,

        setPage: (page) => set({ page }),
        setLimit: (limit) => set({ limit }),
        setSearch: (search) => set({ search, page: 1 }),
        setStatus: (status) => set({ status, page: 1 }),
        setStartDate: (date) => set({ startDate: date, page: 1 }),
        setEndDate: (date) => set({ endDate: date, page: 1 }),
        setFilterContact: (contact) => set({ filterContact: contact, page: 1 }),
        setFilterAccountId: (accountId) =>
            set({ filterAccountId: accountId, page: 1 }),
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
        setSortOrder: (order) => {
            set({ order, page: 1 });
        },
        resetFilters: () => set(initialState),

        getApiFilters: () => {
            const state = get();
            const filters: JournalEntryFilters & {
                sort?: string;
                order?: SortDirection;
            } = {
                page: state.page,
                limit: state.limit,
            };

            if (state.search) filters.search = state.search;
            if (state.status !== 'all') filters.status = state.status;
            if (state.startDate) filters.startDate = state.startDate;
            if (state.endDate) filters.endDate = state.endDate;
            if (state.filterAccountId)
                filters.accountId = state.filterAccountId;
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
