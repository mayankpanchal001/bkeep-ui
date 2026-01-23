import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import axiosInstance from '../axiosClient';

// ========= Types =========
export type RuleCondition = {
    id: string;
    field: string;
    operator: string;
    valueString?: string;
    valueNumber?: number;
    valueNumberTo?: number;
    caseSensitive?: boolean;
};

export type RuleAction = {
    id: string;
    actionType: string;
    payload?: Record<string, unknown>;
};

export type Rule = {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    transactionType?: string;
    matchType?: 'all' | 'any';
    autoApply?: boolean;
    stopOnMatch?: boolean;
    priority?: number;
    accountScope?: 'all' | 'selected';
    accountIds?: string[];
    conditions?: RuleCondition[];
    actions?: RuleAction[];
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
};

export type RulesQueryParams = {
    page?: number;
    limit?: number;
    search?: string;
    enabled?: boolean;
    active?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
};

export type RulesListResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: Rule[];
        pagination?: {
            page: number;
            limit: number;
            offset: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    };
};

export type RuleResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: Rule;
};

export type CreateRulePayload = {
    name: string;
    description?: string;
    active?: boolean;
    transactionType?: string;
    matchType?: 'all' | 'any';
    autoApply?: boolean;
    stopOnMatch?: boolean;
    priority?: number;
    accountScope?: 'all' | 'selected';
    accountIds?: string[];
    conditions?: RuleCondition[];
    actions?: RuleAction[];
};

export type UpdateRulePayload = Partial<CreateRulePayload>;

export type TestRulePayload = {
    ruleId?: string;
    rule?: CreateRulePayload;
    transactionIds?: string[];
};

export type TestRuleResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        matchedTransactions?: unknown[];
        preview?: unknown;
    };
};

// ========= List Rules =========
export const getRules = async (
    params: RulesQueryParams = {}
): Promise<RulesListResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined)
        queryParams.append('page', String(params.page));
    if (params.limit !== undefined)
        queryParams.append('limit', String(params.limit));
    if (params.search) queryParams.append('search', params.search);
    if (params.enabled !== undefined)
        queryParams.append('enabled', String(params.enabled));
    if (params.active !== undefined)
        queryParams.append('active', String(params.active));
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const url = `/rules${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get(url);
    return response.data;
};

export const useRules = (params: RulesQueryParams = {}) => {
    return useQuery<RulesListResponse, Error>({
        queryKey: ['rules', params],
        queryFn: () => getRules(params),
    });
};

// ========= Get Rule by ID =========
export const getRuleById = async (id: string): Promise<RuleResponse> => {
    const response = await axiosInstance.get(`/rules/${id}`);
    return response.data;
};

export const useRule = (id: string) => {
    return useQuery<RuleResponse, Error>({
        queryKey: ['rule', id],
        queryFn: () => getRuleById(id),
        enabled: !!id,
    });
};

// ========= Create Rule =========
export const createRule = async (
    payload: CreateRulePayload
): Promise<RuleResponse> => {
    const response = await axiosInstance.post('/rules', payload);
    return response.data;
};

export const useCreateRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRulePayload) => createRule(payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Rule created successfully');
            queryClient.invalidateQueries({ queryKey: ['rules'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to create rule';
            showErrorToast(message);
        },
    });
};

// ========= Update Rule =========
export const updateRule = async (
    id: string,
    payload: UpdateRulePayload
): Promise<RuleResponse> => {
    const response = await axiosInstance.patch(`/rules/${id}`, payload);
    return response.data;
};

export const useUpdateRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateRulePayload;
        }) => updateRule(id, payload),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Rule updated successfully');
            queryClient.invalidateQueries({ queryKey: ['rules'] });
            queryClient.invalidateQueries({ queryKey: ['rule'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to update rule';
            showErrorToast(message);
        },
    });
};

// ========= Delete Rule =========
export const deleteRule = async (id: string): Promise<RuleResponse> => {
    const response = await axiosInstance.delete(`/rules/${id}`);
    return response.data;
};

export const useDeleteRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRule(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Rule deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['rules'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to delete rule';
            showErrorToast(message);
        },
    });
};

// ========= Enable Rule =========
export const enableRule = async (id: string): Promise<RuleResponse> => {
    const response = await axiosInstance.post(`/rules/${id}/enable`);
    return response.data;
};

export const useEnableRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => enableRule(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Rule enabled successfully');
            queryClient.invalidateQueries({ queryKey: ['rules'] });
            queryClient.invalidateQueries({ queryKey: ['rule'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to enable rule';
            showErrorToast(message);
        },
    });
};

// ========= Disable Rule =========
export const disableRule = async (id: string): Promise<RuleResponse> => {
    const response = await axiosInstance.post(`/rules/${id}/disable`);
    return response.data;
};

export const useDisableRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => disableRule(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Rule disabled successfully');
            queryClient.invalidateQueries({ queryKey: ['rules'] });
            queryClient.invalidateQueries({ queryKey: ['rule'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to disable rule';
            showErrorToast(message);
        },
    });
};

// ========= Restore Rule =========
export const restoreRule = async (id: string): Promise<RuleResponse> => {
    const response = await axiosInstance.patch(`/rules/${id}/restore`);
    return response.data;
};

export const useRestoreRule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => restoreRule(id),
        onSuccess: (data) => {
            showSuccessToast(data?.message || 'Rule restored successfully');
            queryClient.invalidateQueries({ queryKey: ['rules'] });
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to restore rule';
            showErrorToast(message);
        },
    });
};

// ========= Test Rule =========
export const testRule = async (
    payload: TestRulePayload
): Promise<TestRuleResponse> => {
    const response = await axiosInstance.post('/rules/test', payload);
    return response.data;
};

export const useTestRule = () => {
    return useMutation({
        mutationFn: (payload: TestRulePayload) => testRule(payload),
        onSuccess: (data) => {
            showSuccessToast(
                data?.message || 'Rule test completed successfully'
            );
        },
        onError: (error) => {
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                'Failed to test rule';
            showErrorToast(message);
        },
    });
};
