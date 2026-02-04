// Report query parameters
export interface ReportQueryParams {
    startDate?: string;
    endDate?: string;
    /** Single date for balance-sheet / as-of reports (YYYY-MM-DD) */
    asOf?: string;
    // Additional filters can be added as needed
    accountId?: string;
    contactId?: string;
}

// Base report response structure
export interface BaseReportResponse {
    success: boolean;
    statusCode?: number;
    message?: string;
    data: unknown;
}

// Profit and Loss Report (matches API response)
export interface ProfitLossAccountItem {
    accountId: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
    amount: number;
}

export interface ProfitLossReportData {
    from: string;
    to: string;
    totals: {
        income: number;
        expense: number;
        netIncome: number;
    };
    breakdown: {
        income: ProfitLossAccountItem[];
        expense: ProfitLossAccountItem[];
    };
}

export interface ProfitLossReportResponse extends BaseReportResponse {
    data: ProfitLossReportData;
}

// Balance Sheet Report (matches API: asOf, totals, breakdown)
export interface BalanceSheetAccountItem {
    accountId: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
    amount: number;
}

export interface BalanceSheetReportData {
    asOf: string;
    totals: {
        assets: number;
        liabilities: number;
        equity: number;
    };
    breakdown: {
        assets: BalanceSheetAccountItem[];
        liabilities: BalanceSheetAccountItem[];
        equity: BalanceSheetAccountItem[];
    };
}

export interface BalanceSheetReportResponse extends BaseReportResponse {
    data: BalanceSheetReportData;
}

// General Ledger Report (matches API: from, to, accounts with lines)
export interface GeneralLedgerLine {
    date?: string;
    transactionId?: string;
    description?: string;
    debit?: number;
    credit?: number;
    balance?: number;
    reference?: string;
}

export interface GeneralLedgerAccount {
    accountId: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
    openingBalance: number;
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
    lines: GeneralLedgerLine[];
}

export interface GeneralLedgerReportData {
    from: string;
    to: string;
    accounts: GeneralLedgerAccount[];
}

export interface GeneralLedgerReportResponse extends BaseReportResponse {
    data: GeneralLedgerReportData;
}

// Cash Flow Report
export interface CashFlowReportData {
    operatingActivities: {
        item: string;
        amount: number;
    }[];
    netCashFromOperating: number;
    investingActivities: {
        item: string;
        amount: number;
    }[];
    netCashFromInvesting: number;
    financingActivities: {
        item: string;
        amount: number;
    }[];
    netCashFromFinancing: number;
    netChangeInCash: number;
    beginningCashBalance: number;
    endingCashBalance: number;
    period: {
        startDate: string;
        endDate: string;
    };
}

export interface CashFlowReportResponse extends BaseReportResponse {
    data: CashFlowReportData;
}

// Unpaid Bills Report
export interface UnpaidBill {
    billId: string;
    billNumber: string;
    vendorName: string;
    vendorId: string;
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    daysOverdue: number;
    status: 'pending' | 'overdue' | 'partial';
}

export interface UnpaidBillsReportData {
    bills: UnpaidBill[];
    summary: {
        totalBills: number;
        totalAmount: number;
        totalPaid: number;
        totalDue: number;
        overdueBills: number;
        overdueAmount: number;
    };
    asOfDate: string;
}

export interface UnpaidBillsReportResponse extends BaseReportResponse {
    data: UnpaidBillsReportData;
}

// Union type for all report responses
export type ReportResponse =
    | ProfitLossReportResponse
    | BalanceSheetReportResponse
    | GeneralLedgerReportResponse
    | CashFlowReportResponse
    | UnpaidBillsReportResponse;

// Report types enum
export type ReportType =
    | 'profit-loss'
    | 'balance-sheet'
    | 'general-ledger'
    | 'cash-flow'
    | 'unpaid-bills';
