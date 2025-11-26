import { useQuery } from '@tanstack/react-query';
import { showErrorToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';
import { UsersListResponse } from '../../types';

export type UsersQueryParams = {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    isVerified?: boolean;
    isActive?: boolean;
};

export async function getUsersRequest(
    params: UsersQueryParams = {}
): Promise<UsersListResponse> {
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
    if (params.search) {
        queryParams.append('search', params.search);
    }
    if (params.isVerified !== undefined) {
        queryParams.append('isVerified', params.isVerified.toString());
    }
    if (params.isActive !== undefined) {
        queryParams.append('isActive', params.isActive.toString());
    }

    const queryString = queryParams.toString();
    const url = `/users${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
}

export const useUsers = (params: UsersQueryParams = {}) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => getUsersRequest(params),
        onError: (error) => {
            console.error('Get Users Failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to fetch users';
            showErrorToast(message);
        },
    });
};

