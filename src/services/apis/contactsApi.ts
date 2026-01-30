import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ContactResponse,
    ContactsListResponse,
    ContactsQueryParams,
    CreateContactPayload,
    ImportFieldsResponse,
    ImportProgressResponse,
    ImportSuccessResponse,
    StartImportPayload,
    UpdateContactPayload,
} from '../../types/contact';
import { showErrorToast, showSuccessToast } from '../../utills/toast.tsx';
import axiosInstance from '../axiosClient';

export async function getContacts(
    params: ContactsQueryParams = {}
): Promise<ContactsListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined)
        queryParams.append('page', String(params.page));
    if (params.limit !== undefined)
        queryParams.append('limit', String(params.limit));
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined)
        queryParams.append('isActive', String(params.isActive));
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const url = `/contacts${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
}

export async function getContactById(id: string): Promise<ContactResponse> {
    const response = await axiosInstance.get(`/contacts/${id}`);
    return response.data;
}

export async function createContact(
    payload: CreateContactPayload
): Promise<ContactResponse> {
    const response = await axiosInstance.post('/contacts', payload);
    return response.data;
}

export async function updateContact(
    id: string,
    payload: UpdateContactPayload
): Promise<ContactResponse> {
    const response = await axiosInstance.put(`/contacts/${id}`, payload);
    return response.data;
}

export async function deleteContact(id: string): Promise<ContactResponse> {
    const response = await axiosInstance.delete(`/contacts/${id}`);
    return response.data;
}

export async function enableContact(id: string): Promise<ContactResponse> {
    const response = await axiosInstance.patch(`/contacts/${id}/enable`);
    return response.data;
}

export async function disableContact(id: string): Promise<ContactResponse> {
    const response = await axiosInstance.patch(`/contacts/${id}/disable`);
    return response.data;
}

export async function restoreContact(id: string): Promise<ContactResponse> {
    const response = await axiosInstance.patch(`/contacts/${id}/restore`);
    return response.data;
}

export async function getContactsImportSample(): Promise<Blob> {
    const response = await axiosInstance.get('/contacts/import/sample', {
        responseType: 'blob',
    });
    return response.data;
}

export async function getContactsImportFields(): Promise<ImportFieldsResponse> {
    const response = await axiosInstance.get('/contacts/import/fields');
    return response.data;
}

export const useContacts = (params: ContactsQueryParams = {}) => {
    return useQuery<ContactsListResponse, Error>({
        queryKey: ['contacts', params],
        queryFn: () => getContacts(params),
    });
};

export const useContact = (id: string) => {
    return useQuery<ContactResponse, Error>({
        queryKey: ['contact', id],
        queryFn: () => getContactById(id),
        enabled: !!id,
    });
};

export const useCreateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateContactPayload) => createContact(payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Contact created successfully');
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (error) => {
            console.error('Create contact failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create contact';
            showErrorToast(message);
        },
    });
};

export const useUpdateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateContactPayload;
        }) => updateContact(id, payload),
        onSuccess: (data, variables) => {
            showSuccessToast(data?.message || 'Contact updated successfully');
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({
                queryKey: ['contact', variables.id],
            });
        },
        onError: (error) => {
            console.error('Update contact failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update contact';
            showErrorToast(message);
        },
    });
};

export const useDeleteContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteContact(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Contact deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (error) => {
            console.error('Delete contact failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to delete contact';
            showErrorToast(message);
        },
    });
};

export const useEnableContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => enableContact(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Contact enabled');
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (error) => {
            console.error('Enable contact failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to enable contact';
            showErrorToast(message);
        },
    });
};

export const useDisableContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => disableContact(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Contact disabled');
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (error) => {
            console.error('Disable contact failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to disable contact';
            showErrorToast(message);
        },
    });
};

export const useRestoreContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreContact(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Contact restored');
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
        onError: (error) => {
            console.error('Restore contact failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to restore contact';
            showErrorToast(message);
        },
    });
};
export const useContactsImportFields = () => {
    return useQuery<ImportFieldsResponse, Error>({
        queryKey: ['contacts-import-fields'],
        queryFn: getContactsImportFields,
    });
};

export async function startContactImport(
    payload: StartImportPayload
): Promise<ImportSuccessResponse> {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('mapping', JSON.stringify(payload.mapping));

    const response = await axiosInstance.post('/contacts/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const useStartContactImport = () => {
    return useMutation({
        mutationFn: (payload: StartImportPayload) =>
            startContactImport(payload),
        onSuccess: () => {
            showSuccessToast('Import started successfully');
        },
        onError: (error) => {
            console.error('Import contact failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to start import';
            showErrorToast(message);
        },
    });
};

export async function getContactImportProgress(
    id: string
): Promise<ImportProgressResponse> {
    const response = await axiosInstance.get(`/contacts/import/${id}/progress`);
    return response.data;
}
