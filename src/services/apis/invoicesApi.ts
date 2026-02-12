import {
    CreateInvoicePayload,
    InvoiceListResponse,
    InvoiceQueryParams,
    InvoiceResponse,
} from '@/types/invoice';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosClient';

export async function getInvoices(
    params: InvoiceQueryParams = {}
): Promise<InvoiceListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined)
        queryParams.append('page', String(params.page));
    if (params.limit !== undefined)
        queryParams.append('limit', String(params.limit));
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const response = await axiosInstance.get(
        `/invoices?${queryParams.toString()}`
    );
    return response.data;
}

export async function getInvoiceById(id: string): Promise<InvoiceResponse> {
    const response = await axiosInstance.get(`/invoices/${id}`);
    return response.data;
}

export async function createInvoice(
    payload: CreateInvoicePayload
): Promise<InvoiceResponse> {
    const response = await axiosInstance.post('/invoices', payload, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

export async function deleteInvoice(id: string): Promise<void> {
    await axiosInstance.delete(`/invoices/${id}`);
}

export const useInvoices = (params: InvoiceQueryParams = {}) =>
    useQuery({
        queryKey: ['invoices', params],
        queryFn: () => getInvoices(params),
    });

export const useInvoice = (id: string) =>
    useQuery({
        queryKey: ['invoices', id],
        queryFn: () => getInvoiceById(id),
        enabled: !!id,
    });

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation<InvoiceResponse, Error, CreateInvoicePayload>({
        mutationFn: createInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: deleteInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
};
