import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

// ============= Types =============

export type AccountType =
    | 'asset'
    | 'liability'
    | 'equity'
    | 'income'
    | 'expense';

export type AccountDetailType =
    | 'checking'
    | 'savings'
    | 'cash'
    | 'money-market'
    | 'rents-held-in-trust'
    | 'trust-account'
    | 'accounts-receivable'
    | 'allowance-for-bad-debts'
    | 'development-costs'
    | 'employee-cash-advances'
    | 'inventory'
    | 'investment'
    | 'loans-to-others'
    | 'fixed-asset'
    | 'accumulated-depletion'
    | 'accumulated-depreciation'
    | 'buildings'
    | 'land'
    | 'furniture'
    | 'accounts-payable'
    | 'credit-card'
    | 'loan'
    | 'retained-earnings'
    | 'revenue'
    | 'cost-of-goods-sold'
    | 'expense'
    | 'other';

export type ChartOfAccount = {
    id: string;
    accountNumber: string;
    accountName: string;
    accountType: AccountType;
    accountSubtype: string | null;
    accountDetailType: AccountDetailType;
    parentAccountId: string | null;
    currentBalance: string;
    openingBalance: string;
    currencyCode: string;
    isActive: boolean;
    description: string;
    trackTax: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateChartOfAccountPayload = {
    accountName: string;
    accountType: AccountType;
    accountDetailType: AccountDetailType;
    openingBalance: number;
    description?: string;
    parentAccountId?: string;
};

export type UpdateChartOfAccountPayload = {
    accountName?: string;
    accountType?: AccountType;
    accountDetailType?: AccountDetailType;
    openingBalance?: number;
    description?: string;
    parentAccountId?: string;
    isActive?: boolean;
};

export type ChartOfAccountsListResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: ChartOfAccount[];
        pagination: {
            page: number;
            limit: number;
            offset: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    };
};

export type ChartOfAccountResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: ChartOfAccount;
};

export type ImportField = {
    key: string;
    label: string;
    required: boolean;
};

export type ImportFieldsResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: ImportField[];
};

export type AccountsTemplatePreviewAccount = {
    accountNumber: string;
    accountName: string;
    accountType: AccountType;
    accountSubtype: string | null;
    accountDetailType: AccountDetailType | null;
    description: string | null;
    openingBalance: number;
    currencyCode: string;
    isSystemAccount: boolean;
    willBeSkipped: boolean;
    skipReason: string | null;
};

export type AccountsTemplatePreviewResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        template: {
            id: string;
            name: string;
            description: string | null;
            templateType: 'chart_of_accounts';
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        };
        accounts: AccountsTemplatePreviewAccount[];
        summary: {
            totalAccounts: number;
            newAccounts: number;
            skippedAccounts: number;
            byType: Record<string, number>;
        };
    };
};

export type AccountsTemplateApplyResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        template: {
            id: string;
            name: string;
            templateType: 'chart_of_accounts';
        };
        usageId: string;
        status: 'success' | 'partial' | 'failed';
        accounts: {
            created: Array<{
                id: string;
                accountNumber: string;
                accountName: string;
                accountType: AccountType;
            }>;
            skipped: Array<{
                accountNumber: string;
                accountName: string;
                accountType: AccountType;
                reason: string;
            }>;
            failed: Array<{
                accountNumber?: string;
                accountName?: string;
                accountType?: AccountType;
                error: string;
            }>;
        };
        summary: {
            totalProcessed: number;
            created: number;
            skipped: number;
            failed: number;
        };
    };
};

export type ChartOfAccountsQueryParams = {
    page?: number;
    limit?: number;
    search?: string;
    accountType?: AccountType;
    accountDetailType?: AccountDetailType;
    isActive?: boolean;
    parentAccountId?: string;
    sort?: string;
    order?: 'asc' | 'desc';
};

// ============= API Functions =============

/**
 * Get all chart of accounts with filters
 */
export async function getChartOfAccounts(
    params?: ChartOfAccountsQueryParams
): Promise<ChartOfAccountsListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page !== undefined) {
        queryParams.append('page', params.page.toString());
    }
    if (params?.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
    }
    if (params?.search) {
        queryParams.append('search', params.search);
    }
    if (params?.accountType) {
        queryParams.append('accountType', params.accountType);
    }
    if (params?.accountDetailType) {
        queryParams.append('accountDetailType', params.accountDetailType);
    }
    if (params?.isActive !== undefined) {
        queryParams.append('isActive', params.isActive.toString());
    }
    if (params?.parentAccountId) {
        queryParams.append('parentAccountId', params.parentAccountId);
    }
    if (params?.sort) {
        queryParams.append('sort', params.sort);
    }
    if (params?.order) {
        queryParams.append('order', params.order);
    }

    const queryString = queryParams.toString();
    const url = `/accounts${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
}

/**
 * Get a specific chart of account by ID
 */
export async function getChartOfAccountById(
    id: string
): Promise<ChartOfAccountResponse> {
    const response = await axiosInstance.get(`/accounts/${id}`);
    return response.data;
}

/**
 * Create a new chart of account
 */
export async function createChartOfAccount(
    payload: CreateChartOfAccountPayload
): Promise<ChartOfAccountResponse> {
    const response = await axiosInstance.post('/accounts', payload);
    return response.data;
}

/**
 * Update a chart of account
 */
export async function updateChartOfAccount(
    id: string,
    payload: UpdateChartOfAccountPayload
): Promise<ChartOfAccountResponse> {
    const response = await axiosInstance.put(`/accounts/${id}`, payload);
    return response.data;
}

/**
 * Delete a chart of account
 */
export async function deleteChartOfAccount(
    id: string
): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/accounts/${id}`);
    return response.data;
}

/**
 * Restore a soft-deleted chart of account
 */
export async function restoreChartOfAccount(
    id: string
): Promise<ChartOfAccountResponse> {
    const response = await axiosInstance.patch(`/accounts/${id}/restore`);
    return response.data;
}

/**
 * Get import fields configuration
 */
export async function getImportFields(): Promise<ImportFieldsResponse> {
    const response = await axiosInstance.get('/accounts/import/fields');
    return response.data;
}

export async function getAccountsTemplatePreview(
    templateId: string
): Promise<AccountsTemplatePreviewResponse> {
    const response = await axiosInstance.get(
        `/accounts/template/${templateId}/preview`
    );
    return response.data;
}

export async function applyAccountsTemplate(
    templateId: string
): Promise<AccountsTemplateApplyResponse> {
    const response = await axiosInstance.post(
        `/accounts/template/${templateId}/apply`,
        {}
    );
    return response.data;
}

/**
 * Download sample data for import
 */
export async function downloadSampleData(): Promise<Blob> {
    const response = await axiosInstance.get('/accounts/import/sample', {
        responseType: 'blob',
        headers: {
            Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
    });
    return response.data;
}

/**
 * Import chart of accounts from file
 */
export async function importChartOfAccounts(
    file: File,
    mapping?: Record<string, string>
): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (mapping) {
        formData.append('mapping', JSON.stringify(mapping));
    }

    const response = await axiosInstance.post('/accounts/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

// ============= React Query Hooks =============

/**
 * Hook to get import fields
 */
export const useImportFields = () => {
    return useQuery<ImportFieldsResponse, Error>({
        queryKey: ['accounts-import-fields'],
        queryFn: getImportFields,
        staleTime: Infinity, // Fields config unlikely to change often
    });
};

export const useAccountsTemplatePreview = (templateId?: string) => {
    return useQuery<AccountsTemplatePreviewResponse, Error>({
        queryKey: ['accounts-template-preview', templateId],
        queryFn: () => getAccountsTemplatePreview(String(templateId)),
        enabled: !!templateId,
    });
};

export const useApplyAccountsTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => applyAccountsTemplate(templateId),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message ||
                    'Chart of accounts template applied successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Apply accounts template failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to apply chart of accounts template';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to get all chart of accounts
 */
export const useChartOfAccounts = (params?: ChartOfAccountsQueryParams) => {
    return useQuery<ChartOfAccountsListResponse, Error>({
        queryKey: ['accounts', params],
        queryFn: () => getChartOfAccounts(params),
    });
};

/**
 * Hook to get a single chart of account
 */
export const useChartOfAccount = (id: string) => {
    return useQuery<ChartOfAccountResponse, Error>({
        queryKey: ['chart-of-account', id],
        queryFn: () => getChartOfAccountById(id),
        enabled: !!id,
    });
};

/**
 * Hook to import chart of accounts
 */
export const useImportChartOfAccounts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            file,
            mapping,
        }: {
            file: File;
            mapping?: Record<string, string>;
        }) => importChartOfAccounts(file, mapping),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Chart of accounts imported successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Import chart of accounts failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to import chart of accounts';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to create a chart of account
 */
export const useCreateChartOfAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateChartOfAccountPayload) =>
            createChartOfAccount(payload),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Chart of account created successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Create chart of account failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create chart of account';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to update a chart of account
 */
export const useUpdateChartOfAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateChartOfAccountPayload;
        }) => updateChartOfAccount(id, payload),
        onSuccess: (data, variables) => {
            showSuccessToast(
                data?.message || 'Chart of account updated successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({
                queryKey: ['chart-of-account', variables.id],
            });
        },
        onError: (error) => {
            console.error('Update chart of account failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update chart of account';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to delete a chart of account
 */
export const useDeleteChartOfAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteChartOfAccount(id),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Chart of account deleted successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Delete chart of account failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to delete chart of account';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to restore a chart of account
 */
export const useRestoreChartOfAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => restoreChartOfAccount(id),
        onSuccess: (data, id) => {
            showSuccessToast(
                data?.message || 'Chart of account restored successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({
                queryKey: ['chart-of-account', id],
            });
        },
        onError: (error) => {
            console.error('Restore chart of account failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to restore chart of account';
            showErrorToast(message);
        },
    });
};
