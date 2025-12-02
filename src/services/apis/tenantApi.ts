import { useQuery } from '@tanstack/react-query';
import { PaginationInfo, Tenant } from '../../types';
import { showErrorToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

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

export const useTenants = (params: TenantsQueryParams = {}) => {
    return useQuery<TenantsListResponse, Error>({
        queryKey: ['tenants', params],
        queryFn: async () => {
            try {
                return await getTenantsRequest(params);
            } catch (error) {
                console.error('Get Tenants Failed:', error);
                const maybeAxiosError = error as {
                    response?: { data?: { message?: string } };
                };
                const message =
                    maybeAxiosError.response?.data?.message ||
                    'Failed to fetch tenants';
                showErrorToast(message);
                throw error;
            }
        },
    });
};
