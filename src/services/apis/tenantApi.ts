import {
    PLURAL_TENANT_PREFIX,
    SINGLE_TENANT_PREFIX,
} from '@/components/homepage/constants';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationInfo, Tenant } from '../../types';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

export const invalidateTenantQueries = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['tenants'] });
    queryClient.invalidateQueries({ queryKey: ['user-tenants'] });
};

export type TenantsQueryParams = {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
};

export type TenantsListResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: Tenant[];
        pagination: PaginationInfo;
    };
};

export type TenantResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: Tenant;
};

// Get user-accessible tenants (for all users)
export async function getUserTenantsRequest(
    params: TenantsQueryParams = {}
): Promise<TenantsListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
        queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
    }
    if (params.sort) {
        queryParams.append('sort', params.sort);
    }
    if (params.order) {
        queryParams.append('order', params.order);
    }

    const queryString = queryParams.toString();
    const url = `/tenants${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
}

// Get all tenants (requires admin permissions)
export async function getTenantsRequest(
    params: TenantsQueryParams = {}
): Promise<TenantsListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
        queryParams.append('page', params.page.toString());
    }
    if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
    }
    if (params.sort) {
        queryParams.append('sort', params.sort);
    }
    if (params.order) {
        queryParams.append('order', params.order);
    }

    const queryString = queryParams.toString();
    const url = `/tenants/all${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
}

export async function getTenantByIdRequest(
    id: string
): Promise<TenantResponse> {
    const response = await axiosInstance.get(`/tenants/${id}`);
    return response.data;
}

export const useTenantById = (
    id?: string,
    options?: { enabled?: boolean; showErrorToast?: boolean }
) => {
    return useQuery<TenantResponse, Error>({
        queryKey: ['tenant', id],
        enabled: options?.enabled !== false && !!id,
        queryFn: async () => {
            try {
                if (!id) {
                    throw new Error('Tenant ID is required');
                }
                return await getTenantByIdRequest(id);
            } catch (error) {
                const maybeAxiosError = error as {
                    response?: {
                        status?: number;
                        data?: { message?: string };
                    };
                };

                if (options?.showErrorToast !== false) {
                    const message =
                        maybeAxiosError.response?.data?.message ||
                        `Failed to fetch ${SINGLE_TENANT_PREFIX}`;
                    showErrorToast(message);
                }
                throw error;
            }
        },
        retry: false,
    });
};

// Hook for getting user-accessible tenants (works for all users)
export const useUserTenants = (params: TenantsQueryParams = {}) => {
    return useQuery<TenantsListResponse, Error>({
        queryKey: ['user-tenants', params],
        queryFn: async () => {
            try {
                return await getUserTenantsRequest(params);
            } catch (error) {
                console.error('Get User Tenants Failed:', error);
                const maybeAxiosError = error as {
                    response?: {
                        status?: number;
                        data?: { message?: string };
                    };
                };
                const message =
                    maybeAxiosError.response?.data?.message ||
                    `Failed to fetch ${PLURAL_TENANT_PREFIX}`;
                showErrorToast(message);
                throw error;
            }
        },
        retry: false,
    });
};

// Hook for getting all tenants (requires admin permissions)
export const useTenants = (
    params: TenantsQueryParams = {},
    options?: { showErrorToast?: boolean }
) => {
    return useQuery<TenantsListResponse, Error>({
        queryKey: ['tenants', params],
        queryFn: async () => {
            try {
                return await getTenantsRequest(params);
            } catch (error) {
                console.error('Get Tenants Failed:', error);
                const maybeAxiosError = error as {
                    response?: {
                        status?: number;
                        data?: { message?: string };
                    };
                };

                // Don't show toast for 403 errors if disabled (permission issues)
                if (
                    options?.showErrorToast !== false ||
                    maybeAxiosError.response?.status !== 403
                ) {
                    const message =
                        maybeAxiosError.response?.data?.message ||
                        `Failed to fetch ${PLURAL_TENANT_PREFIX}`;
                    showErrorToast(message);
                }
                throw error;
            }
        },
        retry: false, // Don't retry on failure (especially for permission errors)
    });
};

export type CreateTenantRequest = {
    name: string;
    schemaName: string;
    email?: string;
    phone?: string;
    address?: string;
    fiscalYear?: string;
    dateOfIncorporation?: string;
};

export type CreateTenantResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: Tenant;
};

export async function createTenantRequest(
    data: CreateTenantRequest
): Promise<CreateTenantResponse> {
    const response = await axiosInstance.post('/tenants', data);
    return response.data;
}

// Helper function to extract exact error message from API response
const extractErrorMessage = (
    error: unknown,
    defaultMessage?: string
): string => {
    const axiosError = error as {
        response?: {
            data?: {
                message?: string | string[];
                errors?:
                    | string[]
                    | Record<string, string | string[]>
                    | Array<{ field: string; message: string }>;
                error?: string;
            };
        };
        message?: string;
    };

    // Check for response data
    if (axiosError.response?.data) {
        const data = axiosError.response.data;

        // Handle errors array with field and message objects (validation errors)
        if (data.errors && Array.isArray(data.errors)) {
            // Check if it's an array of error objects with field and message
            if (
                data.errors.length > 0 &&
                typeof data.errors[0] === 'object' &&
                'field' in data.errors[0] &&
                'message' in data.errors[0]
            ) {
                const errorMessages = (data.errors as Array<{
                    field: string;
                    message: string;
                }>).map((err) => `${err.field}: ${err.message}`);
                return errorMessages.join('; ');
            }
            // Handle simple string array
            return data.errors.join(', ');
        }

        // Handle errors object (key-value pairs)
        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
            const errorMessages: string[] = [];
            Object.entries(data.errors).forEach(([field, messages]) => {
                const fieldMessages = Array.isArray(messages)
                    ? messages.join(', ')
                    : messages;
                errorMessages.push(`${field}: ${fieldMessages}`);
            });
            return errorMessages.join('; ');
        }

        // Handle array of messages
        if (Array.isArray(data.message)) {
            return data.message.join(', ');
        }

        // Handle single message
        if (data.message) {
            return data.message;
        }

        // Handle error field
        if (data.error) {
            return data.error;
        }
    }

    // Fallback to axios error message or default
    return (
        axiosError.message ||
        defaultMessage ||
        `Failed to process ${SINGLE_TENANT_PREFIX}`
    );
};

// Helper function to extract field-level errors from API response
export const extractFieldErrors = (
    error: unknown
): Record<string, string> => {
    const axiosError = error as {
        response?: {
            data?: {
                errors?: Array<{ field: string; message: string }>;
            };
        };
    };

    const fieldErrors: Record<string, string> = {};

    if (
        axiosError.response?.data?.errors &&
        Array.isArray(axiosError.response.data.errors)
    ) {
        axiosError.response.data.errors.forEach((err) => {
            if (err.field && err.message) {
                // If field already has an error, append the new one
                if (fieldErrors[err.field]) {
                    fieldErrors[err.field] += `; ${err.message}`;
                } else {
                    fieldErrors[err.field] = err.message;
                }
            }
        });
    }

    return fieldErrors;
};

export const useCreateTenant = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateTenantResponse, Error, CreateTenantRequest>({
        mutationFn: async (data) => {
            try {
                return await createTenantRequest(data);
            } catch (error) {
                console.error('Create Tenant Failed:', error);
                const errorMessage = extractErrorMessage(
                    error,
                    `Failed to create ${SINGLE_TENANT_PREFIX}`
                );
                showErrorToast(errorMessage);
                throw error;
            }
        },
        onSuccess: (data) => {
            showSuccessToast(
                data.message || `${SINGLE_TENANT_PREFIX} created successfully`
            );
            invalidateTenantQueries(queryClient);
        },
    });
};

export type UpdateTenantRequest = Partial<CreateTenantRequest>;

export async function updateTenantRequest(
    id: string,
    data: UpdateTenantRequest
): Promise<CreateTenantResponse> {
    const response = await axiosInstance.patch(`/tenants/${id}`, data);
    return response.data;
}

export const useUpdateTenant = () => {
    const queryClient = useQueryClient();

    return useMutation<
        CreateTenantResponse,
        Error,
        { id: string; data: UpdateTenantRequest }
    >({
        mutationFn: async ({ id, data }) => {
            try {
                return await updateTenantRequest(id, data);
            } catch (error) {
                console.error('Update Tenant Failed:', error);
                const errorMessage = extractErrorMessage(
                    error,
                    `Failed to update ${SINGLE_TENANT_PREFIX}`
                );
                showErrorToast(errorMessage);
                throw error;
            }
        },
        onSuccess: (data) => {
            showSuccessToast(
                data.message || `${SINGLE_TENANT_PREFIX} updated successfully`
            );
            invalidateTenantQueries(queryClient);
        },
    });
};

export type SwitchTenantResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
    };
};

export async function switchTenantRequest(
    tenantId: string
): Promise<SwitchTenantResponse> {
    const response = await axiosInstance.post(
        `/tenants/${tenantId}/switch`,
        {}
    );
    return response.data;
}

export const useSwitchTenant = () => {
    return useMutation<SwitchTenantResponse, Error, string>({
        mutationFn: async (tenantId) => {
            try {
                console.log('Switching to tenant:', tenantId);
                return await switchTenantRequest(tenantId);
            } catch (error) {
                console.error('Switch Tenant Failed:', error);
                const errorMessage = extractErrorMessage(
                    error,
                    `Failed to switch ${SINGLE_TENANT_PREFIX}`
                );
                showErrorToast(errorMessage);
                throw error;
            }
        },
        onSuccess: (data) => {
            showSuccessToast(
                data.message || `${SINGLE_TENANT_PREFIX} switched successfully`
            );
        },
    });
};
