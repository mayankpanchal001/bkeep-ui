import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateJournalEntryPayload,
    JournalEntriesListResponse,
    JournalEntryFilters,
    JournalEntryResponse,
    UpdateJournalEntryPayload,
} from '../../types/journal';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

// ============= API Functions =============

/**
 * Get all journal entries with filters
 */
export async function getJournalEntries(
    filters?: JournalEntryFilters
): Promise<JournalEntriesListResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.isAdjusting !== undefined)
        params.append('isAdjusting', filters.isAdjusting.toString());

    const response = await axiosInstance.get(
        `/journal-entries${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
}

/**
 * Get a specific journal entry by ID
 */
export async function getJournalEntryById(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.get(`/journal-entries/${id}`);
    return response.data;
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(
    payload: CreateJournalEntryPayload
): Promise<JournalEntryResponse> {
    const formData = new FormData();

    // Add basic fields
    if (payload.journalNo) formData.append('journalNo', payload.journalNo);
    formData.append('journalDate', payload.journalDate);
    formData.append('isAdjusting', payload.isAdjusting.toString());
    formData.append('lines', JSON.stringify(payload.lines));
    if (payload.memo) formData.append('memo', payload.memo);
    if (payload.isRecurring)
        formData.append('isRecurring', payload.isRecurring.toString());
    if (payload.recurringFrequency)
        formData.append('recurringFrequency', payload.recurringFrequency);

    // Add attachments
    if (payload.attachments && payload.attachments.length > 0) {
        payload.attachments.forEach((file) => {
            formData.append('attachments', file);
        });
    }

    const response = await axiosInstance.post('/journal-entries', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

/**
 * Update a journal entry
 */
export async function updateJournalEntry(
    id: string,
    payload: UpdateJournalEntryPayload
): Promise<JournalEntryResponse> {
    const formData = new FormData();

    // Add fields that are being updated
    if (payload.journalNo) formData.append('journalNo', payload.journalNo);
    if (payload.journalDate)
        formData.append('journalDate', payload.journalDate);
    if (payload.isAdjusting !== undefined)
        formData.append('isAdjusting', payload.isAdjusting.toString());
    if (payload.lines) formData.append('lines', JSON.stringify(payload.lines));
    if (payload.memo !== undefined) formData.append('memo', payload.memo);
    if (payload.isRecurring !== undefined)
        formData.append('isRecurring', payload.isRecurring.toString());
    if (payload.recurringFrequency)
        formData.append('recurringFrequency', payload.recurringFrequency);

    // Add attachments
    if (payload.attachments && payload.attachments.length > 0) {
        payload.attachments.forEach((file) => {
            formData.append('attachments', file);
        });
    }

    const response = await axiosInstance.put(
        `/journal-entries/${id}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(
    id: string
): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/journal-entries/${id}`);
    return response.data;
}

/**
 * Post a journal entry
 */
export async function postJournalEntry(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.post(`/journal-entries/${id}/post`);
    return response.data;
}

/**
 * Void a journal entry
 */
export async function voidJournalEntry(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.post(`/journal-entries/${id}/void`);
    return response.data;
}

/**
 * Reverse a posted journal entry
 */
export async function reverseJournalEntry(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.post(`/journal-entries/${id}/reverse`);
    return response.data;
}

/**
 * Restore a soft-deleted journal entry
 */
export async function restoreJournalEntry(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.patch(
        `/journal-entries/${id}/restore`
    );
    return response.data;
}

// ============= React Query Hooks =============

/**
 * Hook to get all journal entries
 */
export const useJournalEntries = (filters?: JournalEntryFilters) => {
    return useQuery<JournalEntriesListResponse, Error>({
        queryKey: ['journal-entries', filters],
        queryFn: () => getJournalEntries(filters),
    });
};

/**
 * Hook to get a single journal entry
 */
export const useJournalEntry = (id: string) => {
    return useQuery<JournalEntryResponse, Error>({
        queryKey: ['journal-entry', id],
        queryFn: () => getJournalEntryById(id),
        enabled: !!id,
    });
};

/**
 * Hook to create a journal entry
 */
export const useCreateJournalEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateJournalEntryPayload) =>
            createJournalEntry(payload),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Journal entry created successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
        },
        onError: (error) => {
            console.error('Create journal entry failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create journal entry';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to update a journal entry
 */
export const useUpdateJournalEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateJournalEntryPayload;
        }) => updateJournalEntry(id, payload),
        onSuccess: (data, variables) => {
            showSuccessToast(
                data?.message || 'Journal entry updated successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({
                queryKey: ['journal-entry', variables.id],
            });
        },
        onError: (error) => {
            console.error('Update journal entry failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update journal entry';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to delete a journal entry
 */
export const useDeleteJournalEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteJournalEntry(id),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Journal entry deleted successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
        },
        onError: (error) => {
            console.error('Delete journal entry failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to delete journal entry';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to post a journal entry
 */
export const usePostJournalEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postJournalEntry(id),
        onSuccess: (data, id) => {
            showSuccessToast(
                data?.message || 'Journal entry posted successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-entry', id] });
        },
        onError: (error) => {
            console.error('Post journal entry failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to post journal entry';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to void a journal entry
 */
export const useVoidJournalEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => voidJournalEntry(id),
        onSuccess: (data, id) => {
            showSuccessToast(
                data?.message || 'Journal entry voided successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-entry', id] });
        },
        onError: (error) => {
            console.error('Void journal entry failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to void journal entry';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to reverse a journal entry
 */
export const useReverseJournalEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reverseJournalEntry(id),
        onSuccess: (data, id) => {
            showSuccessToast(
                data?.message || 'Journal entry reversed successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-entry', id] });
        },
        onError: (error) => {
            console.error('Reverse journal entry failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to reverse journal entry';
            showErrorToast(message);
        },
    });
};

/**
 * Hook to restore a journal entry
 */
export const useRestoreJournalEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => restoreJournalEntry(id),
        onSuccess: (data, id) => {
            showSuccessToast(
                data?.message || 'Journal entry restored successfully'
            );
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['journal-entry', id] });
        },
        onError: (error) => {
            console.error('Restore journal entry failed:', error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to restore journal entry';
            showErrorToast(message);
        },
    });
};
