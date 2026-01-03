import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../axiosClient';
import { TaxFilters, TaxListResponse } from '../../types/tax';

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
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await axiosInstance.get(`/taxes?${params.toString()}`);
    return response.data;
}

/**
 * Hook to get taxes
 */
export const useTaxes = (filters?: TaxFilters) => {
    return useQuery({
        queryKey: ['taxes', filters],
        queryFn: () => getTaxes(filters),
    });
};
