import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosClient';
import { PaginationInfo } from '../../types';
import { showErrorToast, showSuccessToast } from '../../utills/toast';

export type Account = {
    id: string;
    name: string;
    number: string | null;
    type: string;
    currencyCode: string;
    openingBalance: number;
    bankName: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AccountsListResponse = {
    success: boolean;
    message: string;
    data: {
        items: Account[];
        pagination: PaginationInfo;
    };
};

export type AccountResponse = {
    success: boolean;
    message: string;
    data: Account; // Single account
};

export type AccountStatusResponse = {
    success: boolean;
    message: string;
    data: {
        id: string;
        name: string;
        isActive: boolean;
    };
};

// For creating accounts (POST /accounts)
export type CreateAccountPayload = {
    name: string;
    number?: string;
    type?: string;
    currencyCode?: string;
    openingBalance?: number;
    bankName?: string;
    isActive?: boolean;
};

export type UpdateAccountPayload = {
    name?: string;
    number?: string;
    type?: string;
    currencyCode?: string;
    openingBalance?: number;
    bankName?: string;
    isActive?: boolean;
};

export type AccountsQueryParams = {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    isActive?: boolean;
    currencyCode?: string;
};

export type UpdateActivationPayload = {
    isActive: boolean;
};

export async function getAccountsRequest(
    params: AccountsQueryParams = {}
): Promise<AccountsListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
        queryParams.append('page', params.page.toString());
    }

    if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `/accounts${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);

    return response.data;
}
export async function getAccountRequest(id: string): Promise<AccountResponse> {
    const response = await axiosInstance.get(`/accounts/${id}`);
    return response.data;
}

export async function createAccountRequest(
    payload: CreateAccountPayload
): Promise<AccountResponse> {
    const response = await axiosInstance.post('/accounts', payload);
    return response.data;
}

export async function getAccountStatusRequest(
    id: string
): Promise<AccountStatusResponse> {
    const response = await axiosInstance.get(`/accounts/${id}/status`);
    return response.data;
}

export async function updateAccountRequest(
    id: string,
    payload: UpdateAccountPayload
): Promise<AccountResponse> {
    const response = await axiosInstance.put(`/accounts/${id}`, payload);
    return response.data;
}

export async function deleteAccountRequest(
    id: string
): Promise<AccountResponse> {
    const response = await axiosInstance.delete(`/accounts/${id}`);
    return response.data;
}

export async function activateAccountRequest(
    id: string
): Promise<AccountResponse> {
    const response = await axiosInstance.patch(`/accounts/${id}/activate`);
    return response.data;
}

export async function deactivateAccountRequest(
    id: string
): Promise<AccountResponse> {
    const response = await axiosInstance.patch(`/accounts/${id}/deactivate`);
    return response.data;
}

export async function updateAccountActivationRequest(
    id: string,
    payload: UpdateActivationPayload
): Promise<AccountResponse> {
    const response = await axiosInstance.patch(
        `/accounts/${id}/activation`,
        payload
    );
    return response.data;
}

export async function restoreAccountRequest(
    id: string
): Promise<AccountResponse> {
    const response = await axiosInstance.patch(`/accounts/${id}/restore`);
    return response.data;
}

//Multiple accounts
export const useAccounts = (params: AccountsQueryParams = {}) => {
    return useQuery<AccountsListResponse, Error>({
        queryKey: ['accounts', params],
        queryFn: () => getAccountsRequest(params),
    });
};

//Single account
export const useAccount = (id: string) => {
    return useQuery<AccountResponse, Error>({
        queryKey: ['account', id],
        queryFn: () => getAccountRequest(id),
        enabled: !!id,
    });
};

export const useAccountStatus = (id: string) => {
    return useQuery<AccountStatusResponse, Error>({
        queryKey: ['account', id, 'status'],
        queryFn: () => getAccountStatusRequest(id),
        enabled: !!id,
    });
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAccountRequest,
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Account created successfully');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Create Account Failed:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maybeAxiosError = error as any;
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create account';
            showErrorToast(message);
        },
    });
};

export const useUpdateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateAccountPayload;
        }) => updateAccountRequest(id, payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Account updated successfully');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({
                queryKey: ['account', data.data.id],
            });
        },
        onError: (error) => {
            console.error('Update Account Failed:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maybeAxiosError = error as any;
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update account';
            showErrorToast(message);
        },
    });
};

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAccountRequest,
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Account deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Delete Account Failed:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maybeAxiosError = error as any;
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to delete account';
            showErrorToast(message);
        },
    });
};

export const useActivateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: activateAccountRequest,
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Account activated successfully');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({
                queryKey: ['account', data.data.id],
            });
        },
        onError: (error) => {
            console.error('Activate Account Failed:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maybeAxiosError = error as any;
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to activate account';
            showErrorToast(message);
        },
    });
};

export const useDeactivateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deactivateAccountRequest,
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Account deactivated successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({
                queryKey: ['account', data.data.id],
            });
        },
        onError: (error) => {
            console.error('Deactivate Account Failed:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maybeAxiosError = error as any;
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to deactivate account';
            showErrorToast(message);
        },
    });
};

export const useUpdateAccountActivation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateActivationPayload;
        }) => updateAccountActivationRequest(id, payload),
        onSuccess: (data) => {
            const action = data.data.isActive ? 'activated' : 'deactivated';
            showSuccessToast(data?.message || `Account ${action} successfully`);
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({
                queryKey: ['account', data.data.id],
            });
        },
        onError: (error) => {
            console.error('Update Account Activation Failed:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maybeAxiosError = error as any;
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update account activation';
            showErrorToast(message);
        },
    });
};

export const useRestoreAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: restoreAccountRequest,
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Account restored successfully');
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
        onError: (error) => {
            console.error('Restore Account Failed:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maybeAxiosError = error as any;
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to restore account';
            showErrorToast(message);
        },
    });
};
