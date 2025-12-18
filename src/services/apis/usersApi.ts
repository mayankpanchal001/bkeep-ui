import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UsersListResponse } from '../../types';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

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
    return useQuery<UsersListResponse, Error>({
        queryKey: ['users', params],
        queryFn: () => getUsersRequest(params),
    });
};

export type InviteUserPayload = {
    name: string;
    email: string;
    roleId: string;
};

type InviteUserResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        id: string;
        email: string;
    };
};

export async function inviteUserRequest(
    payload: InviteUserPayload
): Promise<InviteUserResponse> {
    const response = await axiosInstance.post('/users/invitation', payload);
    return response.data;
}

export const useInviteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: InviteUserPayload) => inviteUserRequest(payload),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'User invitation sent successfully'
            );
            // Invalidate users query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Invite User Failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to send invitation';
            showErrorToast(message);
        },
    });
};

export type UpdateUserPayload = {
    userId: string;
    name: string;
    email: string;
    roleId: string;
    phone?: string;
    isActive?: boolean;
};

type UpdateUserResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        id: string;
        name: string;
        email: string;
    };
};

export async function updateUserRequest(
    payload: UpdateUserPayload
): Promise<UpdateUserResponse> {
    const { userId, ...updateData } = payload;
    const response = await axiosInstance.patch(`/users/${userId}`, updateData);
    return response.data;
}

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateUserPayload) => updateUserRequest(payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'User updated successfully');
            // Invalidate users query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Update User Failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update user';
            showErrorToast(message);
        },
    });
};

// Resend Invitation
type ResendInvitationResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        id: string;
        email: string;
    };
};

export async function resendInvitationRequest(
    invitationId: string
): Promise<ResendInvitationResponse> {
    const response = await axiosInstance.post(
        `/users/invitations/${invitationId}/resend`
    );
    return response.data;
}

export const useResendInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (invitationId: string) =>
            resendInvitationRequest(invitationId),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Invitation resent successfully');
            // Invalidate users query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Resend Invitation Failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to resend invitation';
            showErrorToast(message);
        },
    });
};
