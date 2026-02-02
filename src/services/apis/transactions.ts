import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TransactionItem } from '../../types';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

export type TransactionFilters = {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'pending' | 'posted' | 'voided' | 'reversed';
    accountId?: string;
    startDate?: string;
    endDate?: string;
    contactId?: string; // For supplier filter
    category?: string;
    taxId?: string;
    minAmount?: number;
    maxAmount?: number;
    sort?: string;
    order?: 'asc' | 'desc';
};

export type PaginationInfo = {
    page: number;
    limit: number;
    offset: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type TransactionsListResponse = {
    items: TransactionItem[];
    pagination?: PaginationInfo;
};

const getTransactions = async (
    filters?: TransactionFilters
): Promise<TransactionsListResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) {
        // Map 'pending' to 'draft' for API
        const apiStatus =
            filters.status === 'pending' ? 'draft' : filters.status;
        params.append('status', apiStatus);
    }
    if (filters?.accountId) params.append('accountId', filters.accountId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.contactId) params.append('contactId', filters.contactId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.taxId) params.append('taxId', filters.taxId);
    if (filters?.minAmount !== undefined)
        params.append('amountMin', filters.minAmount.toString());
    if (filters?.maxAmount !== undefined)
        params.append('amountMax', filters.maxAmount.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    const response = await axiosInstance.get(
        `/transactions${params.toString() ? `?${params.toString()}` : ''}`
    );

    // Extract items and pagination from the response if it follows the standard pattern
    if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        return {
            items: response.data.data.items,
            pagination: response.data.data.pagination,
        };
    }
    // Fallback if it returns the array directly
    if (Array.isArray(response.data)) {
        return {
            items: response.data,
            pagination: undefined,
        };
    }
    return {
        items: [],
        pagination: undefined,
    };
};

export const useTransactions = (filters?: TransactionFilters) => {
    // Create a stable query key that includes all filter values
    // This ensures React Query properly detects changes and refetches
    const queryKey = [
        'transactions',
        filters?.page,
        filters?.limit,
        filters?.search,
        filters?.status,
        filters?.accountId,
        filters?.startDate,
        filters?.endDate,
        filters?.contactId,
        filters?.category,
        filters?.taxId,
        filters?.minAmount,
        filters?.maxAmount,
        filters?.sort,
        filters?.order,
    ];

    return useQuery<TransactionsListResponse>({
        queryKey,
        queryFn: () => getTransactions(filters),
    });
};

// ========= Get Transaction (by ID) =========
export const getTransactionById = async (
    id: string
): Promise<TransactionItem> => {
    const response = await axiosInstance.get(`/transactions/${id}`);
    const maybeData = (response.data as unknown as { data?: unknown })?.data;
    const tx = (maybeData || response.data) as TransactionItem;
    return tx;
};

export const useTransactionById = (id?: string, enabled?: boolean) => {
    return useQuery<TransactionItem>({
        queryKey: ['transaction', id],
        queryFn: () => getTransactionById(id as string),
        enabled: !!id && (enabled ?? true),
    });
};

// ========= Create Transaction =========
export type CreateTransactionPayload = {
    type: 'income' | 'expense' | 'transfer';
    accountId: string;
    paidAt: string; // ISO date string
    amount: number;
    currencyCode: string;
    currencyRate: number;
    contactId?: string;
    categoryId?: string;
    paymentMethod?: 'cash' | 'card' | 'bank' | 'check' | 'other';
    reference?: string;
    description?: string;
    taxIds?: string[];
    splitTransactions?: Array<{
        amount: number;
        description?: string;
        taxIds?: string[];
    }>;
};

export type CreateTransactionResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        id: string;
    };
};

export const createTransaction = async (
    payload: CreateTransactionPayload
): Promise<CreateTransactionResponse> => {
    const response = await axiosInstance.post('/transactions', payload);
    return response.data;
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTransactionPayload) =>
            createTransaction(payload),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Transaction created successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create transaction';
            showErrorToast(message);
        },
    });
};

// ========= Update Transaction =========
export const updateTransaction = async (
    id: string,
    payload: Partial<CreateTransactionPayload>
): Promise<CreateTransactionResponse> => {
    const response = await axiosInstance.patch(`/transactions/${id}`, payload);
    return response.data;
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: Partial<CreateTransactionPayload>;
        }) => updateTransaction(id, payload),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Transaction updated successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update transaction';
            showErrorToast(message);
        },
    });
};

// ========= Reconcile Transaction =========
export const reconcileTransaction = async (
    id: string
): Promise<CreateTransactionResponse> => {
    const response = await axiosInstance.post(`/transactions/${id}/reconcile`);
    return response.data;
};

export const useReconcileTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reconcileTransaction(id),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Transaction reconciled successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to reconcile transaction';
            showErrorToast(message);
        },
    });
};

// ========= Void Transaction =========
export const voidTransaction = async (
    id: string
): Promise<CreateTransactionResponse> => {
    const response = await axiosInstance.post(`/transactions/${id}/void`);
    return response.data;
};

export const useVoidTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => voidTransaction(id),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Transaction voided successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to void transaction';
            showErrorToast(message);
        },
    });
};

// ========= Post Transaction =========
export type PostTransactionPayload = {
    counterAccountId: string;
    entryDate: string; // ISO date string
    reference?: string;
    memo?: string;
};

export const postTransaction = async (
    id: string,
    payload: PostTransactionPayload
): Promise<CreateTransactionResponse> => {
    const response = await axiosInstance.post(
        `/transactions/${id}/post`,
        payload
    );
    return response.data;
};

export const usePostTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: PostTransactionPayload;
        }) => postTransaction(id, payload),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Transaction posted successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to post transaction';
            showErrorToast(message);
        },
    });
};

// ========= Reverse Transaction =========
export const reverseTransaction = async (
    id: string
): Promise<CreateTransactionResponse> => {
    const response = await axiosInstance.post(`/transactions/${id}/reverse`);
    return response.data;
};

export const useReverseTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reverseTransaction(id),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Transaction reversed successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to reverse transaction';
            showErrorToast(message);
        },
    });
};

// ========= Split Transaction =========
export type SplitTransactionItem = {
    amount: number;
    categoryId: string;
    description: string;
    taxIds?: string[];
};

export type SplitTransactionPayload = {
    splits: SplitTransactionItem[];
};

export const splitTransaction = async (
    id: string,
    payload: SplitTransactionPayload
): Promise<CreateTransactionResponse> => {
    const response = await axiosInstance.put(
        `/transactions/${id}/split`,
        payload
    );
    console.log('Split Transaction API Response:', response.data);
    return response.data;
};

export const useSplitTransaction = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: SplitTransactionPayload;
        }) => splitTransaction(id, payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Transaction split successfully');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to split transaction';
            showErrorToast(message);
        },
    });
};

export type TransactionImportField = {
    key: string;
    label: string;
    required: boolean;
    formatHint?: string;
};

export type TransactionImportFieldsResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        fields: TransactionImportField[];
        dateFormats?: string[];
    };
};

export type TransactionImportStartResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        id?: string;
        originalFilename?: string;
    };
};

export type TransactionImportProgressResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        id: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        totalRows: number;
        processedRows: number;
        successfulRows: number;
        failedRows: number;
        progress: number;
        errorMessage: string | null;
        errorDetails: string | null;
        startedAt: string;
        completedAt: string | null;
    };
};

export const getTransactionImportFields = async (
    mode?: 'single' | 'double'
): Promise<TransactionImportFieldsResponse> => {
    const params = new URLSearchParams();
    if (mode) params.append('mode', mode);
    const url = `/transactions/import/fields${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
};

export const downloadTransactionSampleSingle = async (): Promise<Blob> => {
    const response = await axiosInstance.get(
        '/transactions/import/sample/single',
        {
            responseType: 'blob',
            headers: {
                Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        }
    );
    return response.data;
};

export const downloadTransactionSampleDouble = async (): Promise<Blob> => {
    const response = await axiosInstance.get(
        '/transactions/import/sample/double',
        {
            responseType: 'blob',
            headers: {
                Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        }
    );
    return response.data;
};

export const startTransactionImport = async (
    file: File,
    mapping?: Record<string, string>,
    accountId?: string,
    dateFormat?: string,
    columnMode?: 'single' | 'double',
    isReverse?: boolean
): Promise<TransactionImportStartResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (mapping) {
        formData.append('fieldMappings', JSON.stringify(mapping));
    }
    if (accountId) {
        formData.append('accountId', accountId);
    }
    if (dateFormat) {
        formData.append('dateFormat', dateFormat);
    }
    if (columnMode) {
        formData.append('columnMode', columnMode);
    }
    if (typeof isReverse === 'boolean') {
        formData.append('isReverse', String(isReverse));
    }
    const response = await axiosInstance.post(
        '/transactions/import',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const getTransactionImportProgress = async (
    importId: string
): Promise<TransactionImportProgressResponse> => {
    const response = await axiosInstance.get(
        `/transactions/import/${importId}/progress`
    );
    return response.data;
};

export const useTransactionImportFields = (mode?: 'single' | 'double') => {
    return useQuery<TransactionImportFieldsResponse, Error>({
        queryKey: ['transactions-import-fields', mode],
        queryFn: () => getTransactionImportFields(mode),
        staleTime: Infinity,
    });
};

export const useStartTransactionImport = () => {
    return useMutation({
        mutationFn: ({
            file,
            mapping,
            accountId,
            dateFormat,
            columnMode,
            isReverse,
        }: {
            file: File;
            mapping?: Record<string, string>;
            accountId?: string;
            dateFormat?: string;
            columnMode?: 'single' | 'double';
            isReverse?: boolean;
        }) =>
            startTransactionImport(
                file,
                mapping,
                accountId,
                dateFormat,
                columnMode,
                isReverse
            ),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Transactions import started successfully'
            );
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to start transactions import';
            showErrorToast(message);
        },
    });
};
