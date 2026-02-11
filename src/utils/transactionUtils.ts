import { type ComboboxOption } from '@/components/ui/combobox';
import { type TransactionItem } from '@/types';

export type TxStatus = 'pending' | 'posted' | 'voided' | 'reversed';

export type BankTransaction = {
    id: string;
    date: string;
    description: string;
    spent?: number;
    received?: number;
    tax?: number;
    taxId?: string;
    taxRate?: number;
    fromTo?: string;
    contactId?: string;
    category?: string;
    matched?: boolean;
    matchedReceiptDocs?: number[];
    status: TxStatus;
    account: string;
    accountId?: string;
};

export const isDatePattern = (str: string): boolean => {
    const datePattern = /^\d{4}(-|\/)?\d{0,2}(-|\/)?\d{0,2}$/;
    return datePattern.test(str.trim());
};

export const parseSearchAsDate = (str: string): string | null => {
    const trimmed = str.trim();
    const fullDateMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (fullDateMatch) {
        const [, year, month, day] = fullDateMatch;
        const date = new Date(
            `${year}-${`${month}`.padStart(2, '0')}-${`${day}`.padStart(2, '0')}`
        );
        if (!isNaN(date.getTime())) return date.toISOString();
    }
    const monthDateMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})$/);
    if (monthDateMatch) {
        const [, year, month] = monthDateMatch;
        const date = new Date(`${year}-${`${month}`.padStart(2, '0')}-01`);
        if (!isNaN(date.getTime())) return date.toISOString();
    }
    const yearMatch = trimmed.match(/^(\d{4})$/);
    if (yearMatch) {
        const [, year] = yearMatch;
        const date = new Date(`${year}-01-01`);
        if (!isNaN(date.getTime())) return date.toISOString();
    }
    return null;
};

export const buildContactNameMap = (contactsData?: {
    data?: { items?: Array<{ id?: string; displayName?: string }> };
}): Map<string, string> => {
    const items = contactsData?.data?.items || [];
    const map = new Map<string, string>();
    for (const contact of items) {
        if (contact?.id && contact?.displayName) {
            map.set(contact.id, contact.displayName);
        }
    }
    return map;
};

export const buildApiFilters = (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: TxStatus | 'all';
    selectedAccountId?: string | null;
    filterStartDate?: string | null;
    filterEndDate?: string | null;
    filterSupplier?: string | null;
    filterCategory?: string | null;
    filterTax?: string | null;
    filterMinAmount?: string | null;
    filterMaxAmount?: string | null;
    sort?: string | null;
    order?: 'asc' | 'desc' | null;
    contactsData?: {
        data?: { items?: Array<{ id?: string; displayName?: string }> };
    };
}): Record<string, unknown> => {
    const {
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
    } = params;

    const filters: Record<string, unknown> = { page, limit };
    const trimmedSearch = search?.trim() || '';
    const searchAsNumber = trimmedSearch ? parseFloat(trimmedSearch) : NaN;
    const isNumericSearch =
        !isNaN(searchAsNumber) &&
        isFinite(searchAsNumber) &&
        !isDatePattern(trimmedSearch);

    if (search) {
        if (isDatePattern(trimmedSearch)) {
            // Parse date manually to avoid timezone issues
            const fullDateMatch = trimmedSearch.match(
                /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
            );
            if (fullDateMatch) {
                const [, year, month, day] = fullDateMatch;
                // Construct ISO strings for start and end of day in UTC
                // Or simply pass the date string if the API supports partial matching
                // Here we construct a precise range
                const startDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    0,
                    0,
                    0,
                    0
                );
                const endDate = new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                    23,
                    59,
                    59,
                    999
                );
                filters.startDate = startDate.toISOString();
                filters.endDate = endDate.toISOString();
            } else {
                const isoDate = parseSearchAsDate(trimmedSearch);
                if (isoDate) filters.startDate = isoDate;
                else filters.search = search;
            }
        } else if (isNumericSearch) {
            // If it's a number, it could be an amount or a reference number
            // We set search as the number string, but we DO NOT block other filters
            filters.search = search;
        } else {
            filters.search = search;
        }
    }

    if (status && status !== 'all') filters.status = status;
    if (selectedAccountId) filters.accountId = selectedAccountId;
    if (filterStartDate) {
        const [year, month, day] = filterStartDate.split('-').map(Number);
        const date = new Date(year, month - 1, day, 0, 0, 0, 0);
        filters.startDate = date.toISOString();
    }
    if (filterEndDate) {
        const [year, month, day] = filterEndDate.split('-').map(Number);
        const date = new Date(year, month - 1, day, 23, 59, 59, 999);
        filters.endDate = date.toISOString();
    }

    if (filterSupplier) {
        // filterSupplier comes from Combobox value which is the ID
        filters.contactId = filterSupplier;
    }
    if (filterCategory) filters.categoryId = filterCategory;
    if (filterTax) filters.taxId = filterTax;

    // Apply amount filters regardless of search type
    if (filterMinAmount) {
        const minAmount = parseFloat(filterMinAmount);
        if (!isNaN(minAmount)) filters.minAmount = minAmount;
    }
    if (filterMaxAmount) {
        const maxAmount = parseFloat(filterMaxAmount);
        if (!isNaN(maxAmount)) filters.maxAmount = maxAmount;
    }

    if (sort) {
        const sortKeyMap: Record<string, string> = {
            date: 'paidAt',
            amount: 'amount',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        };
        const apiSortKey = sortKeyMap[sort] || sort;
        const validApiSortKeys = ['paidAt', 'amount', 'createdAt', 'updatedAt'];
        if (validApiSortKeys.includes(apiSortKey)) {
            filters.sort = apiSortKey;
            if (order) filters.order = order;
        }
    }

    return filters;
};

export const getTransactionStatus = (tx: {
    reconciled?: boolean;
    status?: string;
}): TxStatus => {
    if (!tx) return 'pending';
    const apiStatus = (tx as unknown as { status?: string }).status;
    if (apiStatus === 'draft') return 'pending';
    return (apiStatus as TxStatus) || (tx.reconciled ? 'posted' : 'pending');
};

export const mapApiTransactionsToBank = (
    apiTransactions: TransactionItem[]
): BankTransaction[] => {
    return (apiTransactions || []).map((tx) => {
        const date = tx.paidAt || tx.createdAt;
        const description = tx.description || 'Transaction';
        const rawAmount = parseFloat(tx.amount || '0');

        let spent: number | undefined;
        let received: number | undefined;
        if (tx.type === 'expense') {
            spent = rawAmount;
        } else if (tx.type === 'income') {
            received = rawAmount;
        } else {
            spent = rawAmount;
        }

        const account = tx.account?.accountName || 'Account';
        const accountId = tx.accountId;
        const firstSplit = tx.splits?.[0];

        const contactDisplayName =
            (
                tx as unknown as {
                    contact?: {
                        displayName?: string | null;
                        id?: string | null;
                    } | null;
                }
            ).contact?.displayName ?? undefined;
        const contactId =
            (tx as unknown as { contact?: { id?: string | null } | null })
                .contact?.id ??
            (tx as unknown as { contactId?: string | null }).contactId ??
            undefined;

        const categoryIdTopLevel =
            (
                tx as unknown as {
                    category?: { id?: string | null } | null;
                }
            ).category?.id ?? undefined;
        const categoryIdCandidate =
            categoryIdTopLevel ??
            (tx as unknown as { categoryId?: string | null }).categoryId ??
            (firstSplit as unknown as { categoryId?: string | null })
                ?.categoryId ??
            undefined;

        const taxIdCandidate =
            (tx as unknown as { taxId?: string | null }).taxId ??
            (
                tx as unknown as { taxIds?: Array<string | null | undefined> }
            ).taxIds?.find((id) => !!id) ??
            (firstSplit as unknown as { taxId?: string | null })?.taxId ??
            (
                firstSplit as unknown as {
                    taxIds?: Array<string | null | undefined>;
                }
            )?.taxIds?.find((id) => !!id) ??
            undefined;

        const status = getTransactionStatus(tx);

        return {
            id: tx.id,
            date,
            description,
            spent,
            received,
            tax: undefined,
            taxId: taxIdCandidate || undefined,
            taxRate: undefined,
            fromTo: contactDisplayName || undefined,
            contactId: contactId || undefined,
            category: categoryIdCandidate || undefined,
            matched: tx.reconciled,
            matchedReceiptDocs:
                (tx as unknown as { matchedReceiptDocs?: number[] })
                    .matchedReceiptDocs || undefined,
            status,
            account,
            accountId,
        };
    });
};

export const buildSupplierOptions = (contactsData?: {
    data?: { items?: Array<{ id?: string; displayName?: string }> };
}): ComboboxOption[] => {
    const contacts = contactsData?.data?.items || [];
    return contacts
        .filter((contact) => contact.displayName)
        .map((contact) => ({
            value: contact.displayName as string,
            label: contact.displayName as string,
        }));
};

export const buildCategoryOptions = (accountsData?: {
    data?: {
        items?: Array<{ id: string; accountName: string; accountType: string }>;
    };
}): ComboboxOption[] => {
    const accounts = accountsData?.data?.items || [];
    const categories = accounts.filter(
        (acc) => acc.accountType === 'expense' || acc.accountType === 'income'
    );
    return categories.map((account) => ({
        value: account.id,
        label: account.accountName,
    }));
};

export const buildTaxOptions = (taxesResponse?: {
    data?: { items?: Array<{ id: string; name: string; rate: number }> };
}): { options: ComboboxOption[]; rateById: Record<string, number> } => {
    const taxes = taxesResponse?.data?.items || [];
    const options: ComboboxOption[] = taxes.map((t) => ({
        value: t.id,
        label: `${t.name} (${(t.rate * 1).toFixed(2)}%)`,
    }));
    const rateById: Record<string, number> = {};
    taxes.forEach((t) => {
        rateById[t.id] = t.rate;
    });
    return { options, rateById };
};

export const computeCounts = (
    allTransactions: TransactionItem[]
): {
    pendingCount: number;
    postedCount: number;
    excludedCount: number;
    allCount: number;
} => {
    const pendingCount = (allTransactions || []).filter(
        (tx) => getTransactionStatus(tx) === 'pending'
    ).length;
    const postedCount = (allTransactions || []).filter(
        (tx) => getTransactionStatus(tx) === 'posted'
    ).length;
    const excludedCount = (allTransactions || []).filter(
        (tx) => getTransactionStatus(tx) === 'voided'
    ).length;
    const allCount = (allTransactions || []).length;
    return { pendingCount, postedCount, excludedCount, allCount };
};

export const currency = (n?: number): string =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(n || 0);
