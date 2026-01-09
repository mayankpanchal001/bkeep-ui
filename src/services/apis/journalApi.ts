import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateJournalEntryPayload,
    JournalEntriesListResponse,
    JournalEntry,
    JournalEntryFilters,
    JournalEntryResponse,
    UpdateJournalEntryPayload,
} from '../../types/journal';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

const toNumber = (v: unknown) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

const normalizeJournalEntry = (entry: unknown): JournalEntry => {
    if (!isRecord(entry)) return entry as JournalEntry;
    const lines = Array.isArray(entry.lines) ? entry.lines : [];
    const normalizedLines = lines.map((line) => {
        if (!isRecord(line)) return line;
        return {
            ...line,
            debit: toNumber(line.debit),
            credit: toNumber(line.credit),
            lineNumber:
                typeof line.lineNumber === 'number'
                    ? line.lineNumber
                    : toNumber(line.lineNumber),
            id: typeof line.id === 'string' ? line.id : String(line.id ?? ''),
        };
    });

    return {
        ...(entry as JournalEntry),
        entryNumber:
            typeof entry.entryNumber === 'string'
                ? entry.entryNumber
                : typeof (entry as Record<string, unknown>).journalNo ===
                    'string'
                  ? ((entry as Record<string, unknown>).journalNo as string)
                  : '',
        entryDate:
            typeof entry.entryDate === 'string'
                ? entry.entryDate
                : typeof (entry as Record<string, unknown>).journalDate ===
                    'string'
                  ? ((entry as Record<string, unknown>).journalDate as string)
                  : '',
        totalDebit: toNumber(entry.totalDebit),
        totalCredit: toNumber(entry.totalCredit),
        lines: normalizedLines as JournalEntry['lines'],
    };
};

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
    const payload = response.data as JournalEntriesListResponse;
    const list = payload?.data?.journalEntries;
    if (!Array.isArray(list)) return payload;
    return {
        ...payload,
        data: {
            ...payload.data,
            journalEntries: list.map(normalizeJournalEntry),
        },
    };
}

/**
 * Get a specific journal entry by ID
 */
export async function getJournalEntryById(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.get(`/journal-entries/${id}`);
    const payload = response.data as unknown as {
        success: boolean;
        statusCode: number;
        message: string;
        data?: unknown;
    };

    const data = payload?.data;
    const entry =
        isRecord(data) && 'journalEntry' in data
            ? (data as Record<string, unknown>).journalEntry
            : data;

    if (!entry) return response.data as JournalEntryResponse;

    return {
        ...(payload as unknown as JournalEntryResponse),
        data: {
            journalEntry: normalizeJournalEntry(entry),
        },
    };
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(
    payload: CreateJournalEntryPayload
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.post('/journal-entries', payload);
    return response.data;
}

/**
 * Update a journal entry
 */
export async function updateJournalEntry(
    id: string,
    payload: UpdateJournalEntryPayload
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.put(`/journal-entries/${id}`, payload);
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
    const response = await axiosInstance.post(
        `/journal-entries/${id}/post`,
        {}
    );
    return response.data;
}

/**
 * Void a journal entry
 */
export async function voidJournalEntry(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.post(
        `/journal-entries/${id}/void`,
        {}
    );
    return response.data;
}

/**
 * Reverse a posted journal entry
 */
export async function reverseJournalEntry(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.post(
        `/journal-entries/${id}/reverse`,
        {}
    );
    return response.data;
}

/**
 * Restore a soft-deleted journal entry
 */
export async function restoreJournalEntry(
    id: string
): Promise<JournalEntryResponse> {
    const response = await axiosInstance.patch(
        `/journal-entries/${id}/restore`,
        {}
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
