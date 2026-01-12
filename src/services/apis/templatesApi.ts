import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../axiosClient';
import type {
    TemplateFilters,
    TemplateListResponse,
    TemplateResponse,
} from '../../types/templates';

export async function getTemplates(
    filters?: TemplateFilters
): Promise<TemplateListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString());

    const qs = params.toString();
    const response = await axiosInstance.get(`/templates${qs ? `?${qs}` : ''}`);
    return response.data;
}

export async function getTemplateById(id: string): Promise<TemplateResponse> {
    const response = await axiosInstance.get(`/templates/${id}`);
    return response.data;
}

export const useTemplates = (filters?: TemplateFilters, enabled = true) => {
    return useQuery<TemplateListResponse>({
        queryKey: ['templates', filters],
        queryFn: () => getTemplates(filters),
        enabled,
    });
};

export const useTemplateById = (id?: string, enabled = true) => {
    return useQuery<TemplateResponse>({
        queryKey: ['templates', id],
        queryFn: () => getTemplateById(String(id)),
        enabled: !!id && enabled,
    });
};
