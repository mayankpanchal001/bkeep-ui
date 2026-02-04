import {
    BillResponse,
    BillsListResponse,
    BillsQueryParams,
    CreateBillPayload,
    RecordBillPaymentPayload,
} from '@/types/bill';
import { showErrorToast, showSuccessToast } from '@/utills/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosClient';

export async function getBills(
    params: BillsQueryParams = {}
): Promise<BillsListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined)
        queryParams.append('page', String(params.page));
    if (params.limit !== undefined)
        queryParams.append('limit', String(params.limit));
    if (params.status) queryParams.append('status', params.status);
    if (params.supplierId) queryParams.append('supplierId', params.supplierId);
    if (params.billDateFrom)
        queryParams.append('billDateFrom', params.billDateFrom);
    if (params.billDateTo) queryParams.append('billDateTo', params.billDateTo);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const url = `/bills${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
}

export async function getBillById(id: string): Promise<BillResponse> {
    const response = await axiosInstance.get(`/bills/${id}`);
    return response.data;
}

export async function createBill(
    payload: CreateBillPayload
): Promise<BillResponse> {
    const response = await axiosInstance.post('/bills', payload);
    return response.data;
}

export async function recordBillPayment(
    id: string,
    payload: RecordBillPaymentPayload
): Promise<BillResponse> {
    const response = await axiosInstance.post(`/bills/${id}/pay`, payload);
    return response.data;
}

export async function reverseBillPayment(id: string): Promise<BillResponse> {
    const response = await axiosInstance.post(`/bills/${id}/reverse-payment`);
    return response.data;
}

export const useBills = (params: BillsQueryParams = {}) => {
    return useQuery<BillsListResponse, Error>({
        queryKey: ['bills', params],
        queryFn: () => getBills(params),
    });
};

export const useBill = (id: string) => {
    return useQuery<BillResponse, Error>({
        queryKey: ['bill', id],
        queryFn: () => getBillById(id),
        enabled: !!id,
    });
};

export const useCreateBill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBillPayload) => createBill(payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Bill created successfully');
            queryClient.invalidateQueries({ queryKey: ['bills'] });
        },
        onError: (error) => {
            console.error('Create bill failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create bill';
            showErrorToast(message);
        },
    });
};

export const useRecordBillPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: RecordBillPaymentPayload;
        }) => recordBillPayment(id, payload),
        onSuccess: (data, variables) => {
            showSuccessToast(data?.message || 'Payment recorded successfully');
            queryClient.invalidateQueries({ queryKey: ['bills'] });
            queryClient.invalidateQueries({
                queryKey: ['bill', variables.id],
            });
        },
        onError: (error) => {
            console.error('Record bill payment failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to record payment';
            showErrorToast(message);
        },
    });
};

export const useReverseBillPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reverseBillPayment(id),
        onSuccess: (data, id) => {
            showSuccessToast(data?.message || 'Payment reversed successfully');
            queryClient.invalidateQueries({ queryKey: ['bills'] });
            queryClient.invalidateQueries({ queryKey: ['bill', id] });
        },
        onError: (error) => {
            console.error('Reverse bill payment failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to reverse payment';
            showErrorToast(message);
        },
    });
};
