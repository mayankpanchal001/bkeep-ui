import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    TaxFilters,
    TaxListResponse,
    TaxResponse,
    TaxStatsResponse,
} from '../../types/tax';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

export type TaxTemplatePreviewTax = {
    name: string;
    type?: string;
    rate: number;
    code?: string;
    description?: string;
    isActive?: boolean;
    willBeSkipped?: boolean;
    skipReason?: string | null;
};

export type TaxTemplatePreviewResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        template: {
            id: string;
            name: string;
            description: string | null;
            templateType: 'tax';
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        };
        taxes: TaxTemplatePreviewTax[];
        summary: {
            totalTaxes: number;
            newTaxes: number;
            skippedTaxes: number;
        };
    };
};

export type TaxTemplateApplyResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        template: {
            id: string;
            name: string;
            templateType: 'tax';
        };
        usageId: string;
        status: 'success' | 'partial' | 'failed';
        taxes: {
            created: Array<{
                id: string;
                name: string;
                type?: string;
                rate: number;
            }>;
            skipped: Array<{
                name: string;
                type?: string;
                rate?: number;
                reason: string;
            }>;
            failed: Array<{
                name?: string;
                type?: string;
                rate?: number;
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

/**
 * Get all taxes with filters
 */
export async function getTaxes(filters?: TaxFilters): Promise<TaxListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);
    if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString());

    const response = await axiosInstance.get(`/taxes?${params.toString()}`);
    return response.data;
}

/**
 * Get active taxes
 */
export async function getActiveTaxes(): Promise<TaxListResponse> {
    const response = await axiosInstance.get('/taxes/active');
    return response.data;
}

/**
 * Get tax by ID
 */
export async function getTaxById(id: string): Promise<TaxResponse> {
    const response = await axiosInstance.get(`/taxes/${id}`);
    return response.data;
}

/**
 * Get tax stats
 */
export async function getTaxStats(): Promise<TaxStatsResponse> {
    const response = await axiosInstance.get('/taxes/stats');
    return response.data;
}

/**
 * Create a new tax
 */
export type CreateTaxPayload = {
    name: string;
    rate: number; // decimal e.g. 0.13 for 13%
    code?: string;
    description?: string;
    isActive?: boolean;
};
export async function createTax(
    payload: CreateTaxPayload
): Promise<TaxResponse> {
    const response = await axiosInstance.post('/taxes', payload);
    return response.data;
}

/**
 * Update an existing tax
 */
export type UpdateTaxPayload = Partial<CreateTaxPayload>;
export async function updateTax(
    id: string,
    payload: UpdateTaxPayload
): Promise<TaxResponse> {
    const response = await axiosInstance.put(`/taxes/${id}`, payload);
    return response.data;
}

/**
 * Delete a tax
 */
export async function deleteTax(id: string): Promise<TaxResponse> {
    const response = await axiosInstance.delete(`/taxes/${id}`);
    return response.data;
}

/**
 * Enable/Disable/Restore
 */
export async function enableTax(id: string): Promise<TaxResponse> {
    const response = await axiosInstance.patch(`/taxes/${id}/enable`);
    return response.data;
}
export async function disableTax(id: string): Promise<TaxResponse> {
    const response = await axiosInstance.patch(`/taxes/${id}/disable`);
    return response.data;
}
export async function restoreTax(id: string): Promise<TaxResponse> {
    const response = await axiosInstance.patch(`/taxes/${id}/restore`);
    return response.data;
}

export async function getTaxTemplatePreview(
    templateId: string
): Promise<TaxTemplatePreviewResponse> {
    const response = await axiosInstance.get(
        `/taxes/template/${templateId}/preview`
    );
    return response.data;
}

export async function applyTaxTemplate(
    templateId: string
): Promise<TaxTemplateApplyResponse> {
    const response = await axiosInstance.post(
        `/taxes/template/${templateId}/apply`,
        {}
    );
    return response.data;
}

/**
 * Hook to get taxes
 */
export const useTaxes = (filters?: TaxFilters) => {
    return useQuery<TaxListResponse>({
        queryKey: ['taxes', filters],
        queryFn: () => getTaxes(filters),
    });
};

/**
 * Hook to get active taxes
 */
export const useActiveTaxes = () => {
    return useQuery<TaxListResponse>({
        queryKey: ['taxes', 'active'],
        queryFn: getActiveTaxes,
    });
};

/**
 * Hook to get tax stats
 */
export const useTaxStats = () => {
    return useQuery<TaxStatsResponse>({
        queryKey: ['taxes', 'stats'],
        queryFn: getTaxStats,
    });
};

/**
 * Hook to get a tax by ID
 */
export const useTaxById = (id?: string) => {
    return useQuery<TaxResponse>({
        queryKey: ['taxes', id],
        queryFn: () => getTaxById(String(id)),
        enabled: !!id,
    });
};

export const useTaxTemplatePreview = (templateId?: string) => {
    return useQuery<TaxTemplatePreviewResponse, Error>({
        queryKey: ['taxes-template-preview', templateId],
        queryFn: () => getTaxTemplatePreview(String(templateId)),
        enabled: !!templateId,
    });
};

/**
 * Mutations
 */
export const useCreateTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTaxPayload) => createTax(payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Tax created successfully');
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'stats'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create tax';
            showErrorToast(message);
        },
    });
};

export const useUpdateTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateTaxPayload;
        }) => updateTax(id, payload),
        onSuccess: (data, variables) => {
            showSuccessToast(data?.message || 'Tax updated successfully');
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'stats'] });
            queryClient.invalidateQueries({
                queryKey: ['taxes', variables.id],
            });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update tax';
            showErrorToast(message);
        },
    });
};

export const useDeleteTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTax(id),
        onSuccess: (data, id) => {
            showSuccessToast(data?.message || 'Tax deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', id] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to delete tax';
            showErrorToast(message);
        },
    });
};

export const useEnableTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => enableTax(id),
        onSuccess: (data, id) => {
            showSuccessToast(data?.message || 'Tax enabled');
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', id] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to enable tax';
            showErrorToast(message);
        },
    });
};

export const useDisableTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => disableTax(id),
        onSuccess: (data, id) => {
            showSuccessToast(data?.message || 'Tax disabled');
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', id] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to disable tax';
            showErrorToast(message);
        },
    });
};

export const useRestoreTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreTax(id),
        onSuccess: (data, id) => {
            showSuccessToast(data?.message || 'Tax restored');
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', id] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to restore tax';
            showErrorToast(message);
        },
    });
};

export const useApplyTaxTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (templateId: string) => applyTaxTemplate(templateId),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Tax template applied successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['taxes'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['taxes', 'stats'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to apply tax template';
            showErrorToast(message);
        },
    });
};
