import {
    ArrowLeft,
    ArrowUpDown,
    ChevronDown,
    Loader2,
    Mail,
    MoreVertical,
    Printer,
    RefreshCw,
    Share2,
    StickyNote,
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import {
    Collapsible,
    CollapsibleTrigger,
} from '../../components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import Input from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { APP_TITLE } from '../../constants';
import { useChartOfAccounts } from '../../services/apis/chartsAccountApi';
import { ReportTypeKey, useReport } from '../../services/apis/reportsApi';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import {
    BalanceSheetReportData,
    CashFlowReportData,
    GeneralLedgerReportData,
    ProfitLossReportData,
    UnpaidBillsReportData,
} from '../../types/report';
import {
    type ExportData,
    exportToCSV,
    exportToExcel,
} from '../../utills/export';
import { cn } from '../../utils/cn';

type ReportItem = { key: string; title: string; apiKey?: ReportTypeKey };
type ReportCategory = { key: string; title: string; reports: ReportItem[] };

const REPORT_CATEGORIES: ReportCategory[] = [
    {
        key: 'business-overview',
        title: 'Business overview',
        reports: [
            {
                key: 'balance-sheet',
                title: 'Balance Sheet',
                apiKey: 'balance-sheet',
            },
            {
                key: 'statement-of-cash-flows',
                title: 'Statement of Cash Flows',
                apiKey: 'cash-flow',
            },
            {
                key: 'profit-and-loss',
                title: 'Profit and Loss',
                apiKey: 'profit-loss',
            },
        ],
    },
    {
        key: 'accounting',
        title: 'Accounting',
        reports: [
            {
                key: 'general-ledger',
                title: 'General Ledger',
                apiKey: 'general-ledger',
            },
            { key: 'audit-log', title: 'Audit Log' },
            {
                key: 'unpaid-bills',
                title: 'Unpaid Bills',
                apiKey: 'unpaid-bills',
            },
        ],
    },
];

// Format currency (with symbol for totals)
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Format amount without symbol (for balance sheet line items)
const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

// Format date
const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format period as "January 2026" for report header
const formatPeriodMonthYear = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (
        fromDate.getMonth() === toDate.getMonth() &&
        fromDate.getFullYear() === toDate.getFullYear()
    ) {
        return fromDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }
    return `${formatDate(from)} – ${formatDate(to)}`;
};

// Report period presets (full list for filter dropdown)
const PERIOD_PRESETS: { value: string; label: string }[] = [
    { value: 'all-dates', label: 'All Dates' },
    { value: 'custom-dates', label: 'Custom dates' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This week' },
    { value: 'this-week-to-date', label: 'This week to date' },
    { value: 'this-fiscal-week', label: 'This fiscal week' },
    { value: 'this-month', label: 'This month' },
    { value: 'this-month-to-date', label: 'This month to date' },
    { value: 'this-quarter', label: 'This quarter' },
    { value: 'this-quarter-to-date', label: 'This quarter to date' },
    { value: 'this-fiscal-quarter', label: 'This fiscal quarter' },
    {
        value: 'this-fiscal-quarter-to-date',
        label: 'This fiscal quarter to date',
    },
    { value: 'this-year', label: 'This year' },
    { value: 'this-year-to-date', label: 'This year to date' },
    { value: 'this-year-to-last-month', label: 'This year to last month' },
    { value: 'this-fiscal-year', label: 'This fiscal year' },
    { value: 'this-fiscal-year-to-date', label: 'This fiscal year to date' },
    {
        value: 'this-fiscal-year-to-last-month',
        label: 'This fiscal year to last month',
    },
    { value: 'last-6-months', label: 'Last 6 months' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'recent', label: 'Recent' },
    { value: 'last-week', label: 'Last week' },
    { value: 'last-week-to-date', label: 'Last week to date' },
    { value: 'last-week-to-today', label: 'Last week to today' },
    { value: 'last-month', label: 'Last month' },
    { value: 'last-month-to-date', label: 'Last month to date' },
    { value: 'last-month-to-today', label: 'Last month to today' },
    { value: 'last-quarter', label: 'Last quarter' },
    { value: 'last-quarter-to-date', label: 'Last quarter to date' },
    { value: 'last-quarter-to-today', label: 'Last quarter to today' },
    { value: 'last-fiscal-quarter', label: 'Last fiscal quarter' },
    {
        value: 'last-fiscal-quarter-to-date',
        label: 'Last fiscal quarter to date',
    },
    { value: 'last-year', label: 'Last year' },
    { value: 'last-year-to-date', label: 'Last year to date' },
    { value: 'last-year-to-today', label: 'Last year to today' },
    { value: 'last-fiscal-year', label: 'Last fiscal year' },
    { value: 'last-fiscal-year-to-date', label: 'Last fiscal year to date' },
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-90-days', label: 'Last 90 days' },
    { value: 'last-12-months', label: 'Last 12 months' },
    { value: 'since-30-days-ago', label: 'Since 30 days ago' },
    { value: 'since-60-days-ago', label: 'Since 60 days ago' },
    { value: 'since-90-days-ago', label: 'Since 90 days ago' },
    { value: 'since-365-days-ago', label: 'Since 365 days ago' },
    { value: 'next-week', label: 'Next week' },
    { value: 'next-4-weeks', label: 'Next 4 weeks' },
    { value: 'next-month', label: 'Next month' },
    { value: 'next-quarter', label: 'Next quarter' },
    { value: 'next-fiscal-quarter', label: 'Next fiscal quarter' },
    { value: 'next-year', label: 'Next year' },
    { value: 'next-fiscal-year', label: 'Next fiscal year' },
];

// Helpers: week = Sun–Sat; quarter = Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec; fiscal = calendar for now
function startOfWeek(d: Date): Date {
    const x = new Date(d);
    const day = x.getDay();
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
}
function endOfWeek(d: Date): Date {
    const x = startOfWeek(d);
    x.setDate(x.getDate() + 6);
    return x;
}
function startOfMonth(y: number, m: number): Date {
    return new Date(y, m, 1);
}
function endOfMonth(y: number, m: number): Date {
    return new Date(y, m + 1, 0);
}
function getQuarter(m: number): number {
    return Math.floor(m / 3) + 1;
}
function startOfQuarter(y: number, q: number): Date {
    return new Date(y, (q - 1) * 3, 1);
}
function endOfQuarter(y: number, q: number): Date {
    return new Date(y, q * 3, 0);
}

function getPresetDates(
    preset: string,
    customFrom?: string,
    customTo?: string
): { from: string; to: string } {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const today = new Date(y, m, now.getDate());
    const toIso = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'custom-dates' && customFrom && customTo) {
        return { from: customFrom, to: customTo };
    }

    switch (preset) {
        case 'all-dates':
            return { from: '2000-01-01', to: toIso(today) };
        case 'custom-dates':
            return {
                from: toIso(new Date(y, m, 1)),
                to: toIso(new Date(y, m + 1, 0)),
            };
        case 'today':
            return { from: toIso(today), to: toIso(today) };
        case 'this-week': {
            const s = startOfWeek(today);
            const e = endOfWeek(today);
            return { from: toIso(s), to: toIso(e) };
        }
        case 'this-week-to-date': {
            const s = startOfWeek(today);
            return { from: toIso(s), to: toIso(today) };
        }
        case 'this-fiscal-week':
        case 'this-fiscal-week-to-date': {
            const s = startOfWeek(today);
            const e = endOfWeek(today);
            return { from: toIso(s), to: toIso(e) };
        }
        case 'this-month': {
            return {
                from: toIso(startOfMonth(y, m)),
                to: toIso(endOfMonth(y, m)),
            };
        }
        case 'this-month-to-date':
            return {
                from: toIso(startOfMonth(y, m)),
                to: toIso(today),
            };
        case 'this-quarter': {
            const q = getQuarter(m);
            return {
                from: toIso(startOfQuarter(y, q)),
                to: toIso(endOfQuarter(y, q)),
            };
        }
        case 'this-quarter-to-date': {
            const q = getQuarter(m);
            return {
                from: toIso(startOfQuarter(y, q)),
                to: toIso(today),
            };
        }
        case 'this-fiscal-quarter': {
            const q = getQuarter(m);
            return {
                from: toIso(startOfQuarter(y, q)),
                to: toIso(endOfQuarter(y, q)),
            };
        }
        case 'this-fiscal-quarter-to-date': {
            const q = getQuarter(m);
            return {
                from: toIso(startOfQuarter(y, q)),
                to: toIso(today),
            };
        }
        case 'this-year':
            return { from: `${y}-01-01`, to: `${y}-12-31` };
        case 'this-year-to-date':
            return { from: `${y}-01-01`, to: toIso(today) };
        case 'this-year-to-last-month':
            return {
                from: `${y}-01-01`,
                to: toIso(endOfMonth(y, m - 1)),
            };
        case 'this-fiscal-year':
            return { from: `${y}-01-01`, to: `${y}-12-31` };
        case 'this-fiscal-year-to-date':
            return { from: `${y}-01-01`, to: toIso(today) };
        case 'this-fiscal-year-to-last-month':
            return {
                from: `${y}-01-01`,
                to: toIso(endOfMonth(y, m - 1)),
            };
        case 'last-6-months': {
            const from = new Date(today);
            from.setMonth(from.getMonth() - 6);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return { from: toIso(yesterday), to: toIso(yesterday) };
        }
        case 'recent': {
            const from = new Date(today);
            from.setDate(from.getDate() - 14);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'last-week': {
            const lastSun = new Date(today);
            lastSun.setDate(lastSun.getDate() - 7 - lastSun.getDay());
            const lastSat = new Date(lastSun);
            lastSat.setDate(lastSat.getDate() + 6);
            return { from: toIso(lastSun), to: toIso(lastSat) };
        }
        case 'last-week-to-date':
        case 'last-week-to-today': {
            const lastSun = new Date(today);
            lastSun.setDate(lastSun.getDate() - 7 - lastSun.getDay());
            return { from: toIso(lastSun), to: toIso(today) };
        }
        case 'last-month': {
            const lm = m === 0 ? 11 : m - 1;
            const ly = m === 0 ? y - 1 : y;
            return {
                from: toIso(startOfMonth(ly, lm)),
                to: toIso(endOfMonth(ly, lm)),
            };
        }
        case 'last-month-to-date':
        case 'last-month-to-today': {
            const lm = m === 0 ? 11 : m - 1;
            const ly = m === 0 ? y - 1 : y;
            return {
                from: toIso(startOfMonth(ly, lm)),
                to: toIso(today),
            };
        }
        case 'last-quarter': {
            const q = getQuarter(m);
            const prevQ = q === 1 ? 4 : q - 1;
            const prevY = q === 1 ? y - 1 : y;
            return {
                from: toIso(startOfQuarter(prevY, prevQ)),
                to: toIso(endOfQuarter(prevY, prevQ)),
            };
        }
        case 'last-quarter-to-date':
        case 'last-quarter-to-today': {
            const q = getQuarter(m);
            const prevQ = q === 1 ? 4 : q - 1;
            const prevY = q === 1 ? y - 1 : y;
            return {
                from: toIso(startOfQuarter(prevY, prevQ)),
                to: toIso(today),
            };
        }
        case 'last-fiscal-quarter': {
            const q = getQuarter(m);
            const prevQ = q === 1 ? 4 : q - 1;
            const prevY = q === 1 ? y - 1 : y;
            return {
                from: toIso(startOfQuarter(prevY, prevQ)),
                to: toIso(endOfQuarter(prevY, prevQ)),
            };
        }
        case 'last-fiscal-quarter-to-date': {
            const q = getQuarter(m);
            const prevQ = q === 1 ? 4 : q - 1;
            const prevY = q === 1 ? y - 1 : y;
            return {
                from: toIso(startOfQuarter(prevY, prevQ)),
                to: toIso(today),
            };
        }
        case 'last-year':
            return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
        case 'last-year-to-date':
        case 'last-year-to-today':
            return { from: `${y - 1}-01-01`, to: toIso(today) };
        case 'last-fiscal-year':
            return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
        case 'last-fiscal-year-to-date':
            return { from: `${y - 1}-01-01`, to: toIso(today) };
        case 'last-7-days': {
            const from = new Date(today);
            from.setDate(from.getDate() - 6);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'last-30-days': {
            const from = new Date(today);
            from.setDate(from.getDate() - 29);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'last-90-days': {
            const from = new Date(today);
            from.setDate(from.getDate() - 89);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'last-12-months': {
            const from = new Date(today);
            from.setFullYear(from.getFullYear() - 1);
            from.setMonth(from.getMonth());
            return { from: toIso(from), to: toIso(today) };
        }
        case 'since-30-days-ago': {
            const from = new Date(today);
            from.setDate(from.getDate() - 30);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'since-60-days-ago': {
            const from = new Date(today);
            from.setDate(from.getDate() - 60);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'since-90-days-ago': {
            const from = new Date(today);
            from.setDate(from.getDate() - 90);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'since-365-days-ago': {
            const from = new Date(today);
            from.setDate(from.getDate() - 365);
            return { from: toIso(from), to: toIso(today) };
        }
        case 'next-week': {
            const nextSun = new Date(today);
            nextSun.setDate(nextSun.getDate() + (7 - nextSun.getDay()));
            const nextSat = new Date(nextSun);
            nextSat.setDate(nextSat.getDate() + 6);
            return { from: toIso(nextSun), to: toIso(nextSat) };
        }
        case 'next-4-weeks': {
            const from = new Date(today);
            from.setDate(from.getDate() + 1);
            const to = new Date(from);
            to.setDate(to.getDate() + 27);
            return { from: toIso(from), to: toIso(to) };
        }
        case 'next-month': {
            const nm = m === 11 ? 0 : m + 1;
            const ny = m === 11 ? y + 1 : y;
            return {
                from: toIso(startOfMonth(ny, nm)),
                to: toIso(endOfMonth(ny, nm)),
            };
        }
        case 'next-quarter': {
            const q = getQuarter(m);
            const nextQ = q === 4 ? 1 : q + 1;
            const nextY = q === 4 ? y + 1 : y;
            return {
                from: toIso(startOfQuarter(nextY, nextQ)),
                to: toIso(endOfQuarter(nextY, nextQ)),
            };
        }
        case 'next-fiscal-quarter': {
            const q = getQuarter(m);
            const nextQ = q === 4 ? 1 : q + 1;
            const nextY = q === 4 ? y + 1 : y;
            return {
                from: toIso(startOfQuarter(nextY, nextQ)),
                to: toIso(endOfQuarter(nextY, nextQ)),
            };
        }
        case 'next-year':
            return { from: `${y + 1}-01-01`, to: `${y + 1}-12-31` };
        case 'next-fiscal-year':
            return { from: `${y + 1}-01-01`, to: `${y + 1}-12-31` };
        default:
            return {
                from: toIso(startOfMonth(y, m)),
                to: toIso(endOfMonth(y, m)),
            };
    }
}

// Build flat rows for CSV/Excel export from report payload
function getReportExportData(
    payload: unknown,
    reportType: ReportTypeKey
): ExportData[] {
    if (payload == null || typeof payload !== 'object') return [];
    const p = payload as Record<string, unknown>;

    switch (reportType) {
        case 'profit-loss': {
            const breakdown = p.breakdown as
                | {
                    income?: Array<{ accountName: string; amount: number }>;
                    expense?: Array<{ accountName: string; amount: number }>;
                }
                | undefined;
            const income = Array.isArray(breakdown?.income)
                ? breakdown.income
                : [];
            const expense = Array.isArray(breakdown?.expense)
                ? breakdown.expense
                : [];
            const rows: ExportData[] = [];
            income.forEach((item) => {
                rows.push({
                    Account: item.accountName ?? '',
                    Type: 'Income',
                    Amount: Number(item.amount ?? 0),
                });
            });
            expense.forEach((item) => {
                rows.push({
                    Account: item.accountName ?? '',
                    Type: 'Expense',
                    Amount: Number(item.amount ?? 0),
                });
            });
            const totals = p.totals as
                | { income?: number; expense?: number; netIncome?: number }
                | undefined;
            if (totals) {
                rows.push({
                    Account: 'Total Income',
                    Type: '',
                    Amount: Number(totals.income ?? 0),
                });
                rows.push({
                    Account: 'Total Expense',
                    Type: '',
                    Amount: Number(totals.expense ?? 0),
                });
                rows.push({
                    Account: 'Net Income',
                    Type: '',
                    Amount: Number(totals.netIncome ?? 0),
                });
            }
            return rows;
        }
        case 'balance-sheet': {
            const breakdown = p.breakdown as
                | {
                    assets?: Array<{ accountName: string; amount: number }>;
                    liabilities?: Array<{
                        accountName: string;
                        amount: number;
                    }>;
                    equity?: Array<{ accountName: string; amount: number }>;
                }
                | undefined;
            const rows: ExportData[] = [];
            const assets = Array.isArray(breakdown?.assets)
                ? breakdown.assets
                : [];
            assets.forEach((item) => {
                rows.push({
                    Account: item.accountName ?? '',
                    Type: 'Assets',
                    Amount: Number(item.amount ?? 0),
                });
            });
            const liabilities = Array.isArray(breakdown?.liabilities)
                ? breakdown.liabilities
                : [];
            liabilities.forEach((item) => {
                rows.push({
                    Account: item.accountName ?? '',
                    Type: 'Liabilities',
                    Amount: Number(item.amount ?? 0),
                });
            });
            const equity = Array.isArray(breakdown?.equity)
                ? breakdown.equity
                : [];
            equity.forEach((item) => {
                rows.push({
                    Account: item.accountName ?? '',
                    Type: 'Equity',
                    Amount: Number(item.amount ?? 0),
                });
            });
            const totals = p.totals as
                | { assets?: number; liabilities?: number; equity?: number }
                | undefined;
            if (totals) {
                rows.push({
                    Account: 'Total Assets',
                    Type: '',
                    Amount: Number(totals.assets ?? 0),
                });
                rows.push({
                    Account: 'Total Liabilities',
                    Type: '',
                    Amount: Number(totals.liabilities ?? 0),
                });
                rows.push({
                    Account: 'Total Equity',
                    Type: '',
                    Amount: Number(totals.equity ?? 0),
                });
            }
            return rows;
        }
        default:
            return [];
    }
}

const ReportDetailpage = () => {
    const params = useParams();
    const { selectedTenant } = useTenant();
    const categoryKey = params.category || '';
    const reportKey = params.report || '';

    // Date range derived from period preset (default: this month)
    const [periodPreset, setPeriodPreset] = useState('custom-dates');
    const [customFrom, setCustomFrom] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [customTo, setCustomTo] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });
    const { from: startDate, to: endDate } = useMemo(
        () => getPresetDates(periodPreset, customFrom, customTo),
        [periodPreset, customFrom, customTo]
    );
    const [accountingMethod] = useState<'cash' | 'accrual'>('accrual');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [shouldFetch, setShouldFetch] = useState(false);

    const category = useMemo(
        () => REPORT_CATEGORIES.find((c) => c.key === categoryKey),
        [categoryKey]
    );
    const report = useMemo(
        () => category?.reports.find((r) => r.key === reportKey),
        [category, reportKey]
    );

    // Get report data using the API
    const reportApiKey = report?.apiKey;
    const isGeneralLedger = reportApiKey === 'general-ledger';

    // Fetch chart of accounts for General Ledger account selector
    const { data: accountsData } = useChartOfAccounts(
        isGeneralLedger ? { limit: 500, isActive: true } : undefined
    );
    const accountOptions = useMemo(() => {
        const items = accountsData?.data?.items ?? [];
        return items.map((a) => ({
            value: a.id,
            label: `${a.accountNumber} – ${a.accountName}`,
        }));
    }, [accountsData?.data?.items]);

    const reportParams = useMemo(() => {
        const base = { startDate, endDate };
        if (reportApiKey === 'balance-sheet') {
            return { ...base, asOf: endDate };
        }
        if (reportApiKey === 'unpaid-bills') {
            return { ...base, asOf: endDate };
        }
        if (reportApiKey === 'general-ledger' && selectedAccountId) {
            return { ...base, accountId: selectedAccountId };
        }
        return base;
    }, [reportApiKey, startDate, endDate, selectedAccountId]);

    const canRunGeneralLedger = isGeneralLedger ? !!selectedAccountId : true;
    const reportEnabled = shouldFetch && !!reportApiKey && canRunGeneralLedger;

    const {
        data: reportData,
        isLoading,
        error,
        refetch,
    } = useReport(reportApiKey, reportParams, reportEnabled);

    const handleRunReport = () => {
        if (reportApiKey) {
            setShouldFetch(true);
            refetch();
        }
    };

    const reportPayload = (reportData as { data?: unknown } | undefined)?.data;
    const canPrint =
        !!reportData &&
        !isLoading &&
        !error &&
        reportPayload != null &&
        typeof reportPayload === 'object';

    const handlePrint = () => window.print();

    const handleExportReport = (format: 'excel' | 'pdf' | 'csv') => {
        if (!reportApiKey || !reportData) return;
        const response = reportData as { data?: unknown };
        const payload = response?.data;
        const companyName = selectedTenant?.name ?? 'Report';
        const periodLabel =
            payload != null &&
                typeof payload === 'object' &&
                'from' in payload &&
                'to' in payload
                ? formatPeriodMonthYear(
                    (payload as { from: string }).from,
                    (payload as { to: string }).to
                )
                : payload != null &&
                    typeof payload === 'object' &&
                    'asOf' in payload
                    ? formatDate((payload as { asOf: string }).asOf)
                    : '';

        if (format === 'pdf') {
            window.print();
            return;
        }

        const rows = getReportExportData(payload, reportApiKey);
        if (rows.length === 0) return;
        const baseName = `report-${reportApiKey}-${periodLabel.replace(/\s+/g, '-')}`;

        if (format === 'csv') {
            exportToCSV(rows, baseName);
        } else {
            exportToExcel(
                rows,
                baseName,
                report?.title ?? 'Report',
                companyName,
                periodLabel
            );
        }
    };

    useEffect(() => {
        document.body.classList.add('report-print-page');
        return () => document.body.classList.remove('report-print-page');
    }, []);

    const handlePeriodPresetChange = (value: string) => {
        setPeriodPreset(value);
        if (value !== 'custom-dates') {
            const { from, to } = getPresetDates(value, customFrom, customTo);
            setCustomFrom(from);
            setCustomTo(to);
        }
    };

    const title = report?.title || 'Report';

    // Render report content based on type
    const renderReportContent = () => {
        if (!reportApiKey) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
                    <p className="text-muted-foreground text-sm max-w-sm">
                        This report is not yet available via API.
                    </p>
                </div>
            );
        }

        if (!shouldFetch) {
            return (
                <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground text-sm max-w-sm mb-1">
                        {isGeneralLedger
                            ? 'Select an account above, then click Run report to generate the General Ledger.'
                            : 'Choose a date range above and click Run report to generate.'}
                    </p>
                    <p className="text-muted-foreground/80 text-xs">
                        Your report will appear here.
                    </p>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Generating report...
                    </p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="py-8 text-center border border-destructive/20 rounded-lg bg-destructive/5">
                    <p className="text-destructive text-sm">
                        Failed to load report: {error.message}
                    </p>
                </div>
            );
        }

        const response = reportData as { data?: unknown } | undefined;
        const payload = response?.data;
        if (payload == null || typeof payload !== 'object') {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
                    <p className="text-muted-foreground text-sm">
                        No data available for this report.
                    </p>
                </div>
            );
        }

        // Render based on report type
        const companyName = selectedTenant?.name?.toUpperCase() || 'COMPANY';
        const periodLabel =
            'from' in payload && 'to' in payload
                ? formatPeriodMonthYear(
                    (payload as { from: string }).from,
                    (payload as { to: string }).to
                )
                : '';
        switch (reportApiKey) {
            case 'profit-loss':
                return (
                    <ProfitLossReportView
                        data={payload as ProfitLossReportData}
                        companyName={companyName}
                        periodLabel={periodLabel}
                        accountingMethod={accountingMethod}
                        onExport={handleExportReport}
                        onRefresh={refetch}
                    />
                );
            case 'balance-sheet':
                return (
                    <BalanceSheetReportView
                        data={payload as BalanceSheetReportData}
                        companyName={companyName}
                        accountingMethod={accountingMethod}
                        onExport={handleExportReport}
                    />
                );
            case 'general-ledger':
                return (
                    <GeneralLedgerReportView
                        data={payload as GeneralLedgerReportData}
                    />
                );
            case 'cash-flow':
                return (
                    <CashFlowReportView data={payload as CashFlowReportData} />
                );
            case 'unpaid-bills':
                return (
                    <UnpaidBillsReportView
                        data={payload as UnpaidBillsReportData}
                    />
                );
            default:
                return (
                    <div className="border border-primary/10 rounded p-8 text-center text-primary/60">
                        Report view not implemented.
                    </div>
                );
        }
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-6">
            {/* Header - hidden when printing */}
            <header className="flex justify-between items-center mb-0 print:hidden">
                <h1 className="text-2xl font-medium tracking-tight text-foreground">
                    {title}
                </h1>

                <div className="flex items-center gap-2">
                    {canPrint && (
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="gap-2"
                        >
                            <Printer className="w-4 h-4 shrink-0" />
                            Print
                        </Button>
                    )}
                    <Link to="/reports">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 shrink-0" />
                            Back to reports
                        </Button>
                    </Link>
                </div>
            </header>
            <Separator className="print:hidden" />
            <p className="print:hidden">Report options</p>
            <div className="flex flex-wrap items-end gap-4 print:hidden">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Period
                    </Label>
                    <Select
                        value={periodPreset}
                        onValueChange={handlePeriodPresetChange}
                    >
                        <SelectTrigger className="w-full min-w-[180px] max-w-[280px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                            {PERIOD_PRESETS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        From
                    </Label>
                    <Input
                        type="date"
                        value={customFrom}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCustomFrom(e.target.value)
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        To
                    </Label>
                    <Input
                        type="date"
                        value={customTo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCustomTo(e.target.value)
                        }
                    />
                </div>

                {isGeneralLedger && (
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Account
                        </Label>
                        <Select
                            value={selectedAccountId || undefined}
                            onValueChange={(v) => setSelectedAccountId(v || '')}
                        >
                            <SelectTrigger className="w-full min-w-[240px] max-w-[320px] h-8">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accountOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex gap-4 flex-col items-stretch sm:items-end">
                    <Button
                        className="w-full sm:w-auto min-w-[140px]"
                        onClick={handleRunReport}
                        disabled={
                            isLoading ||
                            !reportApiKey ||
                            (isGeneralLedger && !selectedAccountId)
                        }
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Run report'
                        )}
                    </Button>
                </div>
            </div>
            <Separator className="print:hidden" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Display
                    </Label>
                    <Select defaultValue="total-only">
                        <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="total-only">
                                Total only
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Rows & columns
                    </Label>
                    <Select defaultValue="active">
                        <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                        Compare period
                    </Label>
                    <Select defaultValue="none">
                        <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {/* Report content - print wrapper with BKeep branding (modern document layout) */}
            <section
                id="report-print-wrapper"
                className="report-print-section min-h-[360px] w-full max-w-[min(100%,720px)] mx-auto"
            >
                {/* BKeep branding header - visible only when printing; matches invoice/document style */}
                <div className="report-print-header hidden print:flex print:flex-row print:items-center print:justify-between print:px-8 print:py-6 print:border-b print:border-border print:bg-primary/5 print:rounded-t-lg">
                    <div className="print:flex print:items-center print:gap-4">
                        <img
                            src="/logo.png"
                            alt="BKeep"
                            className="h-12 w-auto object-contain print:block"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-foreground tracking-tight">
                                {APP_TITLE}
                            </h2>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                                {title}
                            </p>
                        </div>
                    </div>
                    <div className="print:text-right print:text-xs print:text-muted-foreground">
                        {typeof window !== 'undefined' && (
                            <p className="print:m-0">
                                {window.location.origin}
                            </p>
                        )}
                    </div>
                </div>
                <div className="report-print-content print:px-8 print:py-6">
                    {renderReportContent()}
                </div>
                {/* BKeep branding footer - visible only when printing */}
                <div className="report-print-footer hidden print:flex print:flex-row print:items-center print:justify-between print:px-8 print:py-4 print:mt-6 print:border-t print:border-border print:bg-muted/30 print:rounded-b-lg print:text-xs print:text-muted-foreground">
                    <span className="font-medium uppercase tracking-wider">
                        Generated by {APP_TITLE}
                    </span>
                    {typeof window !== 'undefined' && (
                        <span>
                            {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            </section>
        </div>
    );
};

// ============================================
// Report View Components
// ============================================

const TOTAL_COL_WIDTH = 'min-w-[120px]';

const ProfitLossReportView = ({
    data,
    companyName,
    periodLabel,
    accountingMethod,
    onExport,
    onRefresh,
}: {
    data: ProfitLossReportData;
    companyName: string;
    periodLabel: string;
    accountingMethod: string;
    onExport?: (format: 'excel' | 'pdf' | 'csv') => void;
    onRefresh?: () => void;
}) => {
    const [incomeOpen, setIncomeOpen] = useState(true);
    const [expenseOpen, setExpenseOpen] = useState(true);

    if (!data || typeof data !== 'object') return null;
    const from = data.from ?? '';
    const to = data.to ?? '';
    const totals = data.totals ?? {};
    const breakdown = data.breakdown;
    const incomeItems = Array.isArray(breakdown?.income)
        ? breakdown.income
        : [];
    const expenseItems = Array.isArray(breakdown?.expense)
        ? breakdown.expense
        : [];
    const reportGeneratedAt = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });
    const totalIncome = Number((totals as { income?: number })?.income ?? 0);
    const totalExpenses = Number(
        (totals as { expense?: number })?.expense ?? 0
    );
    const netIncome = Number(
        (totals as { netIncome?: number })?.netIncome ?? 0
    );

    return (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            {/* Top bar: view selector + actions - hidden when printing */}
            <div className="flex items-center justify-between px-6 py-3 border-b print:hidden">
                <Select defaultValue="normal">
                    <SelectTrigger className="w-[120px] h-8 border-0 bg-transparent shadow-none focus-visible:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onRefresh?.()}
                    >
                        <RefreshCw className="size-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8">
                        <Mail className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => window.print()}
                    >
                        <Printer className="size-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                            >
                                <Share2 className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onExport?.('excel')}
                            >
                                Export to Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport?.('pdf')}>
                                Export to PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport?.('csv')}>
                                Export as CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Centered report header */}
            <div className="px-6 pt-8 pb-8 text-center">
                <h2 className="text-2xl font-bold text-foreground">
                    Profit and Loss
                </h2>
                <p className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {companyName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {periodLabel ||
                        (from && to ? formatPeriodMonthYear(from, to) : '')}
                </p>
            </div>

            {/* Table: Account | Total */}
            <div className="px-6 pb-6">
                <Table
                    enableColumnResize={false}
                    borderStyle="default"
                    containerClassName="rounded-md overflow-hidden"
                >
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead align="left">Account</TableHead>
                            <TableHead
                                align="right"
                                className={TOTAL_COL_WIDTH}
                            >
                                <span className="inline-flex items-center gap-1">
                                    Total
                                    <ArrowUpDown className="size-3.5" />
                                </span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Income section header */}
                        <TableRow className="hover:bg-muted/50 bg-muted/30">
                            <TableCell colSpan={2} className="p-0">
                                <Collapsible
                                    open={incomeOpen}
                                    onOpenChange={setIncomeOpen}
                                >
                                    <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 px-2 rounded hover:bg-muted/50 transition-colors text-left font-medium text-sm text-foreground">
                                        <ChevronDown
                                            className={cn(
                                                'size-4 shrink-0 text-muted-foreground transition-transform',
                                                !incomeOpen && '-rotate-90'
                                            )}
                                        />
                                        Income
                                    </CollapsibleTrigger>
                                </Collapsible>
                            </TableCell>
                        </TableRow>
                        {incomeOpen &&
                            incomeItems.map((item, idx) => (
                                <TableRow
                                    key={item.accountId ?? idx}
                                    className="hover:bg-muted/30"
                                >
                                    <TableCell className="pl-8 text-foreground">
                                        {item.accountName}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        className={cn(
                                            'tabular-nums',
                                            TOTAL_COL_WIDTH
                                        )}
                                    >
                                        {formatCurrency(item.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        <TableRow className="bg-muted/20 hover:bg-muted/30">
                            <TableCell className="pl-8 font-medium">
                                Total for Income
                            </TableCell>
                            <TableCell
                                align="right"
                                className={cn(
                                    'tabular-nums font-medium',
                                    TOTAL_COL_WIDTH
                                )}
                            >
                                {formatCurrency(totalIncome)}
                            </TableCell>
                        </TableRow>

                        {/* Gross Profit */}
                        <TableRow className="bg-muted/50 hover:bg-muted/50 font-medium">
                            <TableCell>Gross Profit</TableCell>
                            <TableCell
                                align="right"
                                className={cn('tabular-nums', TOTAL_COL_WIDTH)}
                            >
                                {formatCurrency(totalIncome)}
                            </TableCell>
                        </TableRow>

                        {/* Expenses section header */}
                        <TableRow className="hover:bg-muted/50 bg-muted/30">
                            <TableCell colSpan={2} className="p-0">
                                <Collapsible
                                    open={expenseOpen}
                                    onOpenChange={setExpenseOpen}
                                >
                                    <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 px-2 rounded hover:bg-muted/50 transition-colors text-left font-medium text-sm text-foreground">
                                        <ChevronDown
                                            className={cn(
                                                'size-4 shrink-0 text-muted-foreground transition-transform',
                                                !expenseOpen && '-rotate-90'
                                            )}
                                        />
                                        Expenses
                                    </CollapsibleTrigger>
                                </Collapsible>
                            </TableCell>
                        </TableRow>
                        {expenseOpen &&
                            expenseItems.map((item, idx) => (
                                <TableRow
                                    key={item.accountId ?? idx}
                                    className="hover:bg-muted/30"
                                >
                                    <TableCell className="pl-8 text-foreground">
                                        {item.accountName}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        className={cn(
                                            'tabular-nums',
                                            TOTAL_COL_WIDTH
                                        )}
                                    >
                                        {formatCurrency(item.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        <TableRow className="bg-muted/20 hover:bg-muted/30">
                            <TableCell className="pl-8 font-medium">
                                Total for Expenses
                            </TableCell>
                            <TableCell
                                align="right"
                                className={cn(
                                    'tabular-nums font-medium',
                                    TOTAL_COL_WIDTH
                                )}
                            >
                                {formatCurrency(totalExpenses)}
                            </TableCell>
                        </TableRow>

                        {/* Profit (Net Income) */}
                        <TableRow className="bg-muted/50 hover:bg-muted/50 font-medium">
                            <TableCell>Profit</TableCell>
                            <TableCell
                                align="right"
                                className={cn(
                                    'tabular-nums font-bold',
                                    TOTAL_COL_WIDTH,
                                    netIncome >= 0
                                        ? 'text-foreground'
                                        : 'text-destructive'
                                )}
                            >
                                {formatCurrency(netIncome)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Footer: Add note (left) | basis & timestamp (right) */}
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                    <StickyNote className="size-4" />
                    Add note
                </button>
                <span className="text-xs text-muted-foreground">
                    {accountingMethod === 'accrual' ? 'Accrual' : 'Cash'} basis
                    | {reportGeneratedAt}
                </span>
            </div>
        </div>
    );
};

const AMOUNT_WIDTH_BS = 'min-w-[120px] text-right tabular-nums';

// Group balance sheet line items by accountType for hierarchical display
function groupByAccountType<T extends { accountType?: string }>(
    items: T[]
): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of items) {
        const key = (item.accountType ?? 'Other').trim() || 'Other';
        const list = map.get(key) ?? [];
        list.push(item);
        map.set(key, list);
    }
    return map;
}

// Human-readable section titles for common account types (balance sheet)
const BS_SECTION_LABELS: Record<string, string> = {
    cash: 'Cash and Cash Equivalent',
    bank: 'Cash and Cash Equivalent',
    'cash-and-cash-equivalent': 'Cash and Cash Equivalent',
    'accounts-receivable': 'Accounts Receivable (A/R)',
    receivable: 'Accounts Receivable (A/R)',
    'property-plant-equipment': 'Property, plant and equipment',
    'fixed-asset': 'Property, plant and equipment',
    'accounts-payable': 'Accounts Payable (A/P)',
    payable: 'Accounts Payable (A/P)',
    'credit-card': 'Credit Card',
    'current-liability': 'Other Current Liabilities',
    'long-term-liability': 'Non-current Liabilities',
    equity: 'Equity',
};

function balanceSheetSectionLabel(accountType: string): string {
    const key = accountType.toLowerCase().replace(/\s+/g, '-');
    return BS_SECTION_LABELS[key] ?? accountType;
}

const BalanceSheetReportView = ({
    data,
    companyName,
    accountingMethod,
    onExport,
}: {
    data: BalanceSheetReportData;
    companyName: string;
    accountingMethod: string;
    onExport?: (format: 'excel' | 'pdf' | 'csv') => void;
}) => {
    const [assetsOpen, setAssetsOpen] = useState(true);
    const [liabEquityOpen, setLiabEquityOpen] = useState(true);
    const [liabilitiesOpen, setLiabilitiesOpen] = useState(true);
    const [equityOpen, setEquityOpen] = useState(true);

    if (!data || typeof data !== 'object') return null;
    const breakdown = data.breakdown ?? {};
    const totals = data.totals ?? {};
    const assets = Array.isArray(breakdown.assets) ? breakdown.assets : [];
    const liabilities = Array.isArray(breakdown.liabilities)
        ? breakdown.liabilities
        : [];
    const equity = Array.isArray(breakdown.equity) ? breakdown.equity : [];
    const asOf = data.asOf ?? '';
    const asOfLabel = asOf ? `As of ${formatDate(asOf)}` : '—';
    const reportGeneratedAt = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });

    const assetsByType = groupByAccountType(assets);
    const liabilitiesByType = groupByAccountType(liabilities);

    return (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            {/* Top bar - hidden when printing */}
            <div className="flex items-center justify-between px-6 py-3 border-b print:hidden">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Collapse
                    </Button>
                    <Select defaultValue="normal">
                        <SelectTrigger className="w-[100px] h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="normal">Sort</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Add notes
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Edit titles
                    </Button>
                </div>
                <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="size-8">
                        <Mail className="size-4 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => window.print()}
                    >
                        <Printer className="size-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                            >
                                <Share2 className="size-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onExport?.('excel')}
                            >
                                Export to Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport?.('pdf')}>
                                Export to PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport?.('csv')}>
                                Export as CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Centered header */}
            <div className="px-6 pt-8 pb-6 text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {companyName}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">
                    Balance Sheet
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {asOfLabel}
                </p>
            </div>

            <Separator />

            {/* Table: Account | Amount */}
            <div className="px-6 py-6 max-w-3xl mx-auto">
                <Table
                    enableColumnResize={false}
                    borderStyle="default"
                    containerClassName="rounded-md overflow-hidden"
                >
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead align="left">Account</TableHead>
                            <TableHead
                                align="right"
                                className={AMOUNT_WIDTH_BS}
                            >
                                Amount
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Assets section header */}
                        <TableRow className="bg-muted/30 hover:bg-muted/50">
                            <TableCell colSpan={2} className="p-0">
                                <Collapsible
                                    open={assetsOpen}
                                    onOpenChange={setAssetsOpen}
                                >
                                    <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 px-2 rounded hover:bg-muted/50 transition-colors text-left font-medium text-foreground">
                                        <ChevronDown
                                            className={cn(
                                                'size-4 shrink-0 text-muted-foreground transition-transform',
                                                !assetsOpen && '-rotate-90'
                                            )}
                                        />
                                        Assets
                                    </CollapsibleTrigger>
                                </Collapsible>
                            </TableCell>
                        </TableRow>
                        {assetsOpen &&
                            assetsByType.size > 0 &&
                            Array.from(assetsByType.entries()).map(
                                ([type, items]) => (
                                    <Fragment key={type}>
                                        {(items ?? []).map((acc, idx) => (
                                            <TableRow
                                                key={acc.accountId ?? idx}
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell className="pl-8 text-foreground">
                                                    {acc.accountName}
                                                </TableCell>
                                                <TableCell
                                                    align="right"
                                                    className={cn(
                                                        'tabular-nums',
                                                        AMOUNT_WIDTH_BS
                                                    )}
                                                >
                                                    {formatAmount(acc.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-muted/20 hover:bg-muted/30 font-medium">
                                            <TableCell className="pl-8">
                                                Total{' '}
                                                {balanceSheetSectionLabel(type)}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                className={cn(
                                                    'tabular-nums',
                                                    AMOUNT_WIDTH_BS
                                                )}
                                            >
                                                {formatCurrency(
                                                    items.reduce(
                                                        (s, i) =>
                                                            s + (i.amount ?? 0),
                                                        0
                                                    )
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                )
                            )}
                        {assetsOpen && assetsByType.size === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={2}
                                    className="pl-8 text-muted-foreground"
                                >
                                    No assets
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow className="border-t-2 border-border font-medium bg-muted/40 hover:bg-muted/40">
                            <TableCell>Total Assets</TableCell>
                            <TableCell
                                align="right"
                                className={cn('tabular-nums', AMOUNT_WIDTH_BS)}
                            >
                                {formatCurrency(totals.assets ?? 0)}
                            </TableCell>
                        </TableRow>

                        {/* Liabilities and Equity section header */}
                        <TableRow className="bg-muted/30 hover:bg-muted/50">
                            <TableCell colSpan={2} className="p-0">
                                <Collapsible
                                    open={liabEquityOpen}
                                    onOpenChange={setLiabEquityOpen}
                                >
                                    <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 px-2 rounded hover:bg-muted/50 transition-colors text-left font-medium text-foreground">
                                        <ChevronDown
                                            className={cn(
                                                'size-4 shrink-0 text-muted-foreground transition-transform',
                                                !liabEquityOpen && '-rotate-90'
                                            )}
                                        />
                                        Liabilities and Equity
                                    </CollapsibleTrigger>
                                </Collapsible>
                            </TableCell>
                        </TableRow>
                        {liabEquityOpen && (
                            <>
                                {/* Liabilities subsection */}
                                <TableRow className="bg-muted/20 hover:bg-muted/30">
                                    <TableCell colSpan={2} className="p-0">
                                        <Collapsible
                                            open={liabilitiesOpen}
                                            onOpenChange={setLiabilitiesOpen}
                                        >
                                            <CollapsibleTrigger className="flex w-full items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-left font-medium text-foreground pl-8">
                                                <ChevronDown
                                                    className={cn(
                                                        'size-4 shrink-0 text-muted-foreground transition-transform',
                                                        !liabilitiesOpen &&
                                                        '-rotate-90'
                                                    )}
                                                />
                                                Liabilities
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    </TableCell>
                                </TableRow>
                                {liabEquityOpen &&
                                    liabilitiesOpen &&
                                    liabilitiesByType.size > 0 &&
                                    Array.from(liabilitiesByType.entries()).map(
                                        ([type, items]) => (
                                            <Fragment key={type}>
                                                {(items ?? []).map(
                                                    (acc, idx) => (
                                                        <TableRow
                                                            key={
                                                                acc.accountId ??
                                                                idx
                                                            }
                                                            className="hover:bg-muted/30"
                                                        >
                                                            <TableCell className="pl-14 text-foreground">
                                                                {
                                                                    acc.accountName
                                                                }
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                className={cn(
                                                                    'tabular-nums',
                                                                    AMOUNT_WIDTH_BS
                                                                )}
                                                            >
                                                                {formatAmount(
                                                                    acc.amount
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                                <TableRow className="bg-muted/20 hover:bg-muted/30 font-medium">
                                                    <TableCell className="pl-14">
                                                        Total{' '}
                                                        {balanceSheetSectionLabel(
                                                            type
                                                        )}
                                                    </TableCell>
                                                    <TableCell
                                                        align="right"
                                                        className={cn(
                                                            'tabular-nums',
                                                            AMOUNT_WIDTH_BS
                                                        )}
                                                    >
                                                        {formatCurrency(
                                                            items.reduce(
                                                                (s, i) =>
                                                                    s +
                                                                    (i.amount ??
                                                                        0),
                                                                0
                                                            )
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            </Fragment>
                                        )
                                    )}
                                {liabEquityOpen &&
                                    liabilitiesOpen &&
                                    liabilitiesByType.size === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                className="pl-14 text-muted-foreground"
                                            >
                                                No liabilities
                                            </TableCell>
                                        </TableRow>
                                    )}
                                <TableRow className="border-t border-border font-medium bg-muted/20 hover:bg-muted/30">
                                    <TableCell className="pl-8">
                                        Total Liabilities
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        className={cn(
                                            'tabular-nums',
                                            AMOUNT_WIDTH_BS
                                        )}
                                    >
                                        {formatCurrency(
                                            totals.liabilities ?? 0
                                        )}
                                    </TableCell>
                                </TableRow>

                                {/* Equity subsection */}
                                <TableRow className="bg-muted/20 hover:bg-muted/30">
                                    <TableCell colSpan={2} className="p-0">
                                        <Collapsible
                                            open={equityOpen}
                                            onOpenChange={setEquityOpen}
                                        >
                                            <CollapsibleTrigger className="flex w-full items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors text-left font-medium text-foreground pl-8">
                                                <ChevronDown
                                                    className={cn(
                                                        'size-4 shrink-0 text-muted-foreground transition-transform',
                                                        !equityOpen &&
                                                        '-rotate-90'
                                                    )}
                                                />
                                                Equity
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    </TableCell>
                                </TableRow>
                                {liabEquityOpen &&
                                    equityOpen &&
                                    equity.length > 0 &&
                                    equity.map((acc, idx) => (
                                        <TableRow
                                            key={acc.accountId ?? idx}
                                            className="hover:bg-muted/30"
                                        >
                                            <TableCell className="pl-14 text-foreground">
                                                {acc.accountName}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                className={cn(
                                                    'tabular-nums',
                                                    AMOUNT_WIDTH_BS
                                                )}
                                            >
                                                {formatAmount(acc.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {liabEquityOpen &&
                                    equityOpen &&
                                    equity.length > 0 && (
                                        <TableRow className="bg-muted/20 hover:bg-muted/30 font-medium">
                                            <TableCell className="pl-14">
                                                Total Equity
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                className={cn(
                                                    'tabular-nums',
                                                    AMOUNT_WIDTH_BS
                                                )}
                                            >
                                                {formatCurrency(
                                                    totals.equity ?? 0
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                {liabEquityOpen &&
                                    equityOpen &&
                                    equity.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                className="pl-14 text-muted-foreground"
                                            >
                                                No equity
                                            </TableCell>
                                        </TableRow>
                                    )}

                                {/* Total Liabilities and Equity */}
                                <TableRow className="border-t-2 border-border font-medium bg-muted/40 hover:bg-muted/40">
                                    <TableCell>
                                        Total Liabilities and Equity
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        className={cn(
                                            'tabular-nums',
                                            AMOUNT_WIDTH_BS
                                        )}
                                    >
                                        {formatCurrency(
                                            (totals.liabilities ?? 0) +
                                            (totals.equity ?? 0)
                                        )}
                                    </TableCell>
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                    <StickyNote className="size-4" />
                    Add note
                </button>
                <span className="text-xs text-muted-foreground">
                    {accountingMethod === 'accrual' ? 'Accrual' : 'Cash'} basis
                    | {reportGeneratedAt}
                </span>
            </div>
        </div>
    );
};

const GeneralLedgerReportView = ({
    data,
}: {
    data: GeneralLedgerReportData;
}) => {
    if (!data || typeof data !== 'object') return null;
    const accounts = Array.isArray(data.accounts) ? data.accounts : [];
    const from = data.from ?? '';
    const to = data.to ?? '';
    return (
        <div className="border border-primary/10 rounded overflow-hidden">
            <div className="bg-primary/5 px-4 py-2 text-sm font-medium">
                Period: {from ? formatDate(from) : '—'} –{' '}
                {to ? formatDate(to) : '—'}
            </div>
            <div className="divide-y divide-primary/10">
                {accounts.map((account, idx) => {
                    const lines = Array.isArray(account.lines)
                        ? account.lines
                        : [];
                    return (
                        <div key={account.accountId ?? idx} className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <span className="font-medium">
                                        {account.accountName}
                                    </span>
                                    <span className="text-muted-foreground text-sm ml-2">
                                        ({account.accountNumber})
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    Opening:{' '}
                                    {formatCurrency(
                                        account.openingBalance ?? 0
                                    )}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left px-2 py-1">
                                                Date
                                            </th>
                                            <th className="text-left px-2 py-1">
                                                Description
                                            </th>
                                            <th className="text-right px-2 py-1">
                                                Debit
                                            </th>
                                            <th className="text-right px-2 py-1">
                                                Credit
                                            </th>
                                            <th className="text-right px-2 py-1">
                                                Balance
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((line, lineIdx) => (
                                            <tr
                                                key={lineIdx}
                                                className="border-t border-primary/5"
                                            >
                                                <td className="px-2 py-1">
                                                    {line.date
                                                        ? formatDate(line.date)
                                                        : '—'}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {line.description ?? '—'}
                                                </td>
                                                <td className="px-2 py-1 text-right">
                                                    {(line.debit ?? 0) > 0
                                                        ? formatCurrency(
                                                            line.debit ?? 0
                                                        )
                                                        : '-'}
                                                </td>
                                                <td className="px-2 py-1 text-right">
                                                    {(line.credit ?? 0) > 0
                                                        ? formatCurrency(
                                                            line.credit ?? 0
                                                        )
                                                        : '-'}
                                                </td>
                                                <td className="px-2 py-1 text-right font-medium">
                                                    {line.balance != null
                                                        ? formatCurrency(
                                                            line.balance
                                                        )
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between mt-2 text-sm font-medium">
                                <span className="text-muted-foreground">
                                    Total Debit:{' '}
                                    {formatCurrency(account.totalDebit ?? 0)} ·
                                    Total Credit:{' '}
                                    {formatCurrency(account.totalCredit ?? 0)}
                                </span>
                                <span>
                                    Closing Balance:{' '}
                                    {formatCurrency(
                                        account.closingBalance ?? 0
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CashFlowReportView = ({ data }: { data: CashFlowReportData }) => {
    if (!data || typeof data !== 'object') return null;
    const period = data.period ?? {};
    const operating = Array.isArray(data.operatingActivities)
        ? data.operatingActivities
        : [];
    const investing = Array.isArray(data.investingActivities)
        ? data.investingActivities
        : [];
    const financing = Array.isArray(data.financingActivities)
        ? data.financingActivities
        : [];
    return (
        <div className="border border-primary/10 rounded overflow-hidden">
            <div className="bg-primary/5 px-4 py-2 text-sm font-medium">
                Period: {period.startDate ? formatDate(period.startDate) : '—'}{' '}
                - {period.endDate ? formatDate(period.endDate) : '—'}
            </div>
            <div className="divide-y divide-primary/10">
                <div className="p-4">
                    <h3 className="font-medium mb-2">
                        Cash Flows from Operating Activities
                    </h3>
                    <div className="space-y-1">
                        {operating.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-sm"
                            >
                                <span className="text-muted-foreground">
                                    {item.item}
                                </span>
                                <span
                                    className={
                                        item.amount >= 0
                                            ? ''
                                            : 'text-destructive'
                                    }
                                >
                                    {formatCurrency(item.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-medium mt-2 pt-2 border-t border-primary/10">
                        <span>Net Cash from Operating</span>
                        <span
                            className={
                                (data.netCashFromOperating ?? 0) >= 0
                                    ? 'text-primary'
                                    : 'text-destructive'
                            }
                        >
                            {formatCurrency(data.netCashFromOperating ?? 0)}
                        </span>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-medium mb-2">
                        Cash Flows from Investing Activities
                    </h3>
                    <div className="space-y-1">
                        {investing.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-sm"
                            >
                                <span className="text-muted-foreground">
                                    {item.item}
                                </span>
                                <span
                                    className={
                                        item.amount >= 0
                                            ? ''
                                            : 'text-destructive'
                                    }
                                >
                                    {formatCurrency(item.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-medium mt-2 pt-2 border-t border-primary/10">
                        <span>Net Cash from Investing</span>
                        <span
                            className={
                                (data.netCashFromInvesting ?? 0) >= 0
                                    ? 'text-primary'
                                    : 'text-destructive'
                            }
                        >
                            {formatCurrency(data.netCashFromInvesting ?? 0)}
                        </span>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-medium mb-2">
                        Cash Flows from Financing Activities
                    </h3>
                    <div className="space-y-1">
                        {financing.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between text-sm"
                            >
                                <span className="text-muted-foreground">
                                    {item.item}
                                </span>
                                <span
                                    className={
                                        item.amount >= 0
                                            ? ''
                                            : 'text-destructive'
                                    }
                                >
                                    {formatCurrency(item.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-medium mt-2 pt-2 border-t border-primary/10">
                        <span>Net Cash from Financing</span>
                        <span
                            className={
                                (data.netCashFromFinancing ?? 0) >= 0
                                    ? 'text-primary'
                                    : 'text-destructive'
                            }
                        >
                            {formatCurrency(data.netCashFromFinancing ?? 0)}
                        </span>
                    </div>
                </div>
                <div className="p-4 bg-primary/5">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Beginning Cash Balance</span>
                            <span>
                                {formatCurrency(data.beginningCashBalance ?? 0)}
                            </span>
                        </div>
                        <div className="flex justify-between font-medium">
                            <span>Net Change in Cash</span>
                            <span
                                className={
                                    (data.netChangeInCash ?? 0) >= 0
                                        ? 'text-primary'
                                        : 'text-destructive'
                                }
                            >
                                {formatCurrency(data.netChangeInCash ?? 0)}
                            </span>
                        </div>
                        <div className="flex justify-between font-medium text-lg pt-2 border-t border-primary/10">
                            <span>Ending Cash Balance</span>
                            <span>
                                {formatCurrency(data.endingCashBalance ?? 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UnpaidBillsReportView = ({ data }: { data: UnpaidBillsReportData }) => {
    if (!data || typeof data !== 'object') return null;
    const bills = Array.isArray(data.bills) ? data.bills : [];
    const summary = data.summary ?? {};
    return (
        <div className="border border-primary/10 rounded overflow-hidden">
            <div className="bg-primary/5 px-4 py-2 text-sm font-medium">
                As of: {data.asOfDate ? formatDate(data.asOfDate) : '—'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-primary/10">
                <div className="bg-muted/30 rounded p-3">
                    <div className="text-sm text-muted-foreground">
                        Total Bills
                    </div>
                    <div className="text-lg font-medium">
                        {summary.totalBills ?? 0}
                    </div>
                </div>
                <div className="bg-muted/30 rounded p-3">
                    <div className="text-sm text-muted-foreground">
                        Total Amount
                    </div>
                    <div className="text-lg font-medium">
                        {formatCurrency(summary.totalAmount ?? 0)}
                    </div>
                </div>
                <div className="bg-muted/30 rounded p-3">
                    <div className="text-sm text-muted-foreground">
                        Amount Due
                    </div>
                    <div className="text-lg font-medium text-primary">
                        {formatCurrency(summary.totalDue ?? 0)}
                    </div>
                </div>
                <div className="bg-destructive/10 rounded p-3">
                    <div className="text-sm text-muted-foreground">Overdue</div>
                    <div className="text-lg font-medium text-destructive">
                        {summary.overdueBills ?? 0} (
                        {formatCurrency(summary.overdueAmount ?? 0)})
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left px-4 py-2">Bill #</th>
                            <th className="text-left px-4 py-2">Vendor</th>
                            <th className="text-left px-4 py-2">Due Date</th>
                            <th className="text-right px-4 py-2">Total</th>
                            <th className="text-right px-4 py-2">Paid</th>
                            <th className="text-right px-4 py-2">Due</th>
                            <th className="text-center px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill, idx) => (
                            <tr
                                key={idx}
                                className="border-t border-primary/5 hover:bg-muted/30"
                            >
                                <td className="px-4 py-2 font-medium">
                                    {bill.billNumber}
                                </td>
                                <td className="px-4 py-2">{bill.vendorName}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className={
                                            bill.daysOverdue > 0
                                                ? 'text-destructive'
                                                : ''
                                        }
                                    >
                                        {formatDate(bill.dueDate)}
                                        {bill.daysOverdue > 0 && (
                                            <span className="ml-1 text-xs">
                                                ({bill.daysOverdue}d overdue)
                                            </span>
                                        )}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {formatCurrency(bill.totalAmount)}
                                </td>
                                <td className="px-4 py-2 text-right text-primary">
                                    {formatCurrency(bill.amountPaid)}
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                    {formatCurrency(bill.amountDue)}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <span
                                        className={cn(
                                            'px-2 py-1 rounded-full text-xs font-medium',
                                            bill.status === 'overdue' &&
                                            'bg-destructive/15 text-destructive',
                                            bill.status === 'pending' &&
                                            'bg-muted text-muted-foreground',
                                            bill.status === 'partial' &&
                                            'bg-primary/10 text-primary'
                                        )}
                                    >
                                        {bill.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportDetailpage;
