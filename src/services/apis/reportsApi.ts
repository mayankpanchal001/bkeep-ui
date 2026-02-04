import { useQuery } from '@tanstack/react-query';
import {
    BalanceSheetReportResponse,
    CashFlowReportResponse,
    GeneralLedgerReportResponse,
    ProfitLossReportResponse,
    ReportQueryParams,
    UnpaidBillsReportResponse,
} from '../../types/report';
import axiosInstance from '../axiosClient';

// Helper to build query string from params
// API expects from/to for date range (e.g. profit-loss), asOf for balance-sheet
function buildQueryString(params: ReportQueryParams = {}): string {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('from', params.startDate);
    if (params.endDate) queryParams.append('to', params.endDate);
    if (params.asOf) queryParams.append('asOf', params.asOf);
    if (params.accountId) queryParams.append('accountId', params.accountId);
    if (params.contactId) queryParams.append('contactId', params.contactId);
    return queryParams.toString();
}

// ============================================
// Profit and Loss Report
// ============================================
export async function getProfitLossReport(
    params: ReportQueryParams = {}
): Promise<ProfitLossReportResponse> {
    const queryString = buildQueryString(params);
    const url = `/reports/profit-loss${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
}

export const useProfitLossReport = (
    params: ReportQueryParams = {},
    enabled = true
) => {
    return useQuery<ProfitLossReportResponse, Error>({
        queryKey: ['report', 'profit-loss', params],
        queryFn: () => getProfitLossReport(params),
        enabled,
    });
};

// ============================================
// Balance Sheet Report
// ============================================
export async function getBalanceSheetReport(
    params: ReportQueryParams = {}
): Promise<BalanceSheetReportResponse> {
    const queryString = buildQueryString(params);
    const url = `/reports/balance-sheet${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
}

export const useBalanceSheetReport = (
    params: ReportQueryParams = {},
    enabled = true
) => {
    return useQuery<BalanceSheetReportResponse, Error>({
        queryKey: ['report', 'balance-sheet', params],
        queryFn: () => getBalanceSheetReport(params),
        enabled,
    });
};

// ============================================
// General Ledger Report
// ============================================
export async function getGeneralLedgerReport(
    params: ReportQueryParams = {}
): Promise<GeneralLedgerReportResponse> {
    const queryString = buildQueryString(params);
    const url = `/reports/general-ledger${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
}

export const useGeneralLedgerReport = (
    params: ReportQueryParams = {},
    enabled = true
) => {
    return useQuery<GeneralLedgerReportResponse, Error>({
        queryKey: ['report', 'general-ledger', params],
        queryFn: () => getGeneralLedgerReport(params),
        enabled,
    });
};

// ============================================
// Cash Flow Report
// ============================================
export async function getCashFlowReport(
    params: ReportQueryParams = {}
): Promise<CashFlowReportResponse> {
    const queryString = buildQueryString(params);
    const url = `/reports/cash-flow${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
}

export const useCashFlowReport = (
    params: ReportQueryParams = {},
    enabled = true
) => {
    return useQuery<CashFlowReportResponse, Error>({
        queryKey: ['report', 'cash-flow', params],
        queryFn: () => getCashFlowReport(params),
        enabled,
    });
};

// ============================================
// Unpaid Bills Report
// ============================================
export async function getUnpaidBillsReport(
    params: ReportQueryParams = {}
): Promise<UnpaidBillsReportResponse> {
    const queryString = buildQueryString(params);
    const url = `/reports/unpaid-bills${queryString ? `?${queryString}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
}

export const useUnpaidBillsReport = (
    params: ReportQueryParams = {},
    enabled = true
) => {
    return useQuery<UnpaidBillsReportResponse, Error>({
        queryKey: ['report', 'unpaid-bills', params],
        queryFn: () => getUnpaidBillsReport(params),
        enabled,
    });
};

// ============================================
// Generic hook to fetch any report by type
// ============================================
export type ReportTypeKey =
    | 'profit-loss'
    | 'balance-sheet'
    | 'general-ledger'
    | 'cash-flow'
    | 'unpaid-bills';

const reportApiFunctions: Record<
    ReportTypeKey,
    (params: ReportQueryParams) => Promise<unknown>
> = {
    'profit-loss': getProfitLossReport,
    'balance-sheet': getBalanceSheetReport,
    'general-ledger': getGeneralLedgerReport,
    'cash-flow': getCashFlowReport,
    'unpaid-bills': getUnpaidBillsReport,
};

export async function getReportByType(
    reportType: ReportTypeKey,
    params: ReportQueryParams = {}
): Promise<unknown> {
    const apiFn = reportApiFunctions[reportType];
    if (!apiFn) {
        throw new Error(`Unknown report type: ${reportType}`);
    }
    return apiFn(params);
}

export const useReport = (
    reportType: ReportTypeKey | undefined,
    params: ReportQueryParams = {},
    enabled = true
) => {
    return useQuery({
        queryKey: ['report', reportType, params],
        queryFn: () => {
            if (!reportType) throw new Error('Report type is required');
            return getReportByType(reportType, params);
        },
        enabled: enabled && !!reportType,
    });
};
