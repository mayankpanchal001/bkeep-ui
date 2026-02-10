import { format, startOfYear } from 'date-fns';
import {
    ArrowDownRight,
    ArrowUpRight,
    BadgeDollarSign,
    Banknote,
    BookOpen,
    CircleDollarSign,
    ExternalLink,
    FileText,
    Landmark,
    Plus,
    Receipt,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';

import { useBills } from '@/services/apis/billsApi';
import { useJournalEntries } from '@/services/apis/journalApi';
import {
    useBalanceSheetReport,
    useCashFlowReport,
    useProfitLossReport,
    useUnpaidBillsReport,
} from '@/services/apis/reportsApi';
import { useTransactions } from '@/services/apis/transactions';
import { AuthStore } from '@/stores/auth/authStore';
import { TenantStore } from '@/stores/tenant/tenantStore';
import { useTransactionsFilterStore } from '@/stores/transactions/transactionsFilterStore';
import { cn } from '@/utils/cn';
import { getThemeColor } from '@/utils/themeColors';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    ChartContainer,
    ChartTooltip,
    type TooltipPayloadItem,
} from '../ui/chart';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';

// ─── Helpers ────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);

const fmtCompact = (n: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(n);

const pct = (n: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(n);

const today = new Date();
const yearStart = format(startOfYear(today), 'yyyy-MM-dd');
const todayStr = format(today, 'yyyy-MM-dd');

// ─── Skeleton loaders ───────────────────────────────────
function KpiSkeleton() {
    return (
        <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

function ChartSkeleton({ height = 260 }: { height?: number }) {
    return (
        <div className="card">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-3 w-56 mb-4" />
            <Skeleton className="w-full rounded-lg" style={{ height }} />
        </div>
    );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="card">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── KPI Card ───────────────────────────────────────────
type KpiCardProps = {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    iconBg: string;
    trend?: { value: number; label: string };
};

function KpiCard({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    trend,
}: KpiCardProps) {
    return (
        <div className="card flex flex-col gap-1 !p-5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {title}
                </span>
                <div
                    className={cn(
                        'flex items-center justify-center w-9 h-9 rounded-lg',
                        iconBg
                    )}
                >
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight">
                {value}
            </p>
            {trend && (
                <div className="flex items-center gap-1.5 mt-1">
                    {trend.value >= 0 ? (
                        <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            {pct(Math.abs(trend.value))}
                        </span>
                    ) : (
                        <span className="flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            {pct(Math.abs(trend.value))}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {trend.label}
                    </span>
                </div>
            )}
            {subtitle && !trend && (
                <span className="text-xs text-muted-foreground mt-1">
                    {subtitle}
                </span>
            )}
        </div>
    );
}

// ─── Income vs Expense Area Chart ───────────────────────
function IncomeExpenseChart({
    incomeItems,
    expenseItems,
}: {
    incomeItems: { accountName: string; amount: number }[];
    expenseItems: { accountName: string; amount: number }[];
}) {
    const primaryColor = getThemeColor('--color-primary');
    const destructiveColor = getThemeColor('--color-destructive');
    const borderColor = getThemeColor('--color-border');
    const textColor = getThemeColor('--color-foreground');

    const totalIncome = incomeItems.reduce((s, i) => s + i.amount, 0);
    const totalExpense = expenseItems.reduce((s, i) => s + i.amount, 0);

    // Build chart data from top income & expense categories
    const topIncome = [...incomeItems]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);
    const topExpense = [...expenseItems]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);

    // Create a combined bar chart dataset of categories
    const maxLen = Math.max(topIncome.length, topExpense.length, 1);
    const data = Array.from({ length: maxLen }, (_, i) => ({
        label:
            topIncome[i]?.accountName ||
            topExpense[i]?.accountName ||
            `Cat ${i + 1}`,
        income: topIncome[i]?.amount || 0,
        expense: topExpense[i]?.amount || 0,
    }));

    const chartConfig = {
        income: { label: 'Income', color: primaryColor },
        expense: { label: 'Expense', color: destructiveColor },
    };

    return (
        <div className="card !p-5">
            <div className="flex items-center justify-between mb-1">
                <div>
                    <h3 className="text-sm font-medium text-foreground">
                        Income vs Expenses
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Top categories this fiscal year
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <span className="text-xs text-muted-foreground">
                            Income {fmtCompact(totalIncome)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: destructiveColor }}
                        />
                        <span className="text-xs text-muted-foreground">
                            Expense {fmtCompact(totalExpense)}
                        </span>
                    </div>
                </div>
            </div>
            <ChartContainer
                config={chartConfig}
                className="w-full"
                style={{ height: '280px' }}
            >
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={borderColor}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: textColor }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: textColor }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => fmtCompact(v)}
                    />
                    <ChartTooltip
                        content={({
                            active,
                            payload,
                        }: {
                            active?: boolean;
                            payload?: TooltipPayloadItem[];
                        }) => {
                            if (!active || !payload?.length) return null;
                            return (
                                <div className="rounded-lg border border-border/50 bg-card p-2.5 shadow-lg">
                                    <p className="font-medium text-xs mb-1.5">
                                        {payload[0].payload?.label as string}
                                    </p>
                                    {payload.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                            <span className="text-muted-foreground">
                                                {item.name}:
                                            </span>
                                            <span className="font-mono font-medium">
                                                {fmt(Number(item.value) || 0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                    <Bar
                        dataKey="income"
                        fill={primaryColor}
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="expense"
                        fill={destructiveColor}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    );
}

// ─── Expense Breakdown Donut ────────────────────────────
const DONUT_COLORS = [
    'oklch(0.65 0.15 150)', // green
    'oklch(0.67 0.14 261)', // blue
    'oklch(0.64 0.21 25)', // red
    'oklch(0.75 0.15 80)', // yellow
    'oklch(0.60 0.15 300)', // purple
    'oklch(0.70 0.12 190)', // teal
];

function ExpenseDonutChart({
    items,
}: {
    items: { accountName: string; amount: number }[];
}) {
    const sorted = [...items].sort((a, b) => b.amount - a.amount);
    const top5 = sorted.slice(0, 5);
    const otherTotal = sorted.slice(5).reduce((s, i) => s + i.amount, 0);
    const data = [
        ...top5.map((item) => ({ name: item.accountName, value: item.amount })),
        ...(otherTotal > 0 ? [{ name: 'Other', value: otherTotal }] : []),
    ];
    const total = data.reduce((s, d) => s + d.value, 0);

    const chartConfig = Object.fromEntries(
        data.map((d, i) => [
            d.name,
            { label: d.name, color: DONUT_COLORS[i % DONUT_COLORS.length] },
        ])
    );

    return (
        <div className="card !p-5 flex flex-col">
            <h3 className="text-sm font-medium text-foreground mb-1">
                Expense Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
                By category this fiscal year
            </p>
            <div className="flex-1 flex items-center justify-center">
                <ChartContainer
                    config={chartConfig}
                    className="w-full"
                    style={{ height: '200px' }}
                >
                    <PieChart>
                        <ChartTooltip
                            content={({
                                active,
                                payload,
                            }: {
                                active?: boolean;
                                payload?: TooltipPayloadItem[];
                            }) => {
                                if (!active || !payload?.length) return null;
                                const item = payload[0];
                                return (
                                    <div className="rounded-lg border border-border/50 bg-card p-2.5 shadow-lg">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor: item
                                                        .payload
                                                        ?.fill as string,
                                                }}
                                            />
                                            <span className="text-muted-foreground">
                                                {item.name}:
                                            </span>
                                            <span className="font-mono font-medium">
                                                {fmt(Number(item.value) || 0)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            strokeWidth={2}
                            stroke="var(--color-card)"
                        >
                            {data.map((_, idx) => (
                                <Cell
                                    key={idx}
                                    fill={
                                        DONUT_COLORS[idx % DONUT_COLORS.length]
                                    }
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                {data.map((d, idx) => (
                    <div
                        key={d.name}
                        className="flex items-center gap-2 min-w-0"
                    >
                        <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                                backgroundColor:
                                    DONUT_COLORS[idx % DONUT_COLORS.length],
                            }}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                            {d.name}
                        </span>
                        <span className="text-xs font-medium text-foreground ml-auto tabular-nums">
                            {total > 0 ? pct(d.value / total) : '0%'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Cash Flow Mini Chart ───────────────────────────────
function CashFlowCard({
    data,
}: {
    data: {
        netCashFromOperating: number;
        netCashFromInvesting: number;
        netCashFromFinancing: number;
        netChangeInCash: number;
        beginningCashBalance: number;
        endingCashBalance: number;
    };
}) {
    const items = [
        { label: 'Operating', value: data.netCashFromOperating },
        { label: 'Investing', value: data.netCashFromInvesting },
        { label: 'Financing', value: data.netCashFromFinancing },
    ];

    const maxAbs = Math.max(...items.map((i) => Math.abs(i.value)), 1);

    return (
        <div className="card !p-5">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-foreground">
                    Cash Flow
                </h3>
                <Link
                    to="/reports/financial/cash-flow"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    View report <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
                Fiscal year to date
            </p>

            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">
                                {item.label}
                            </span>
                            <span
                                className={cn(
                                    'text-xs font-medium tabular-nums',
                                    item.value >= 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                )}
                            >
                                {item.value >= 0 ? '+' : ''}
                                {fmt(item.value)}
                            </span>
                        </div>
                        <Progress
                            value={(Math.abs(item.value) / maxAbs) * 100}
                            className="h-2"
                            indicatorClassName={
                                item.value >= 0
                                    ? 'bg-green-500 dark:bg-green-400'
                                    : 'bg-red-500 dark:bg-red-400'
                            }
                        />
                    </div>
                ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                        Net Change
                    </span>
                    <span
                        className={cn(
                            'text-sm font-bold tabular-nums',
                            data.netChangeInCash >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        )}
                    >
                        {data.netChangeInCash >= 0 ? '+' : ''}
                        {fmt(data.netChangeInCash)}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                        Ending Balance
                    </span>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                        {fmt(data.endingCashBalance)}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Balance Sheet Summary ──────────────────────────────
function BalanceSheetCard({
    data,
}: {
    data: { assets: number; liabilities: number; equity: number };
}) {
    const total = data.assets || 1;
    return (
        <div className="card !p-5">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-foreground">
                    Balance Sheet
                </h3>
                <Link
                    to="/reports/financial/balance-sheet"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    View report <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
            <p className="text-xs text-muted-foreground mb-4">As of today</p>

            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Total Assets
                        </span>
                        <span className="text-sm font-bold text-foreground tabular-nums">
                            {fmt(data.assets)}
                        </span>
                    </div>
                    <Progress
                        value={100}
                        className="h-2"
                        indicatorClassName="bg-primary"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-destructive" />
                            Total Liabilities
                        </span>
                        <span className="text-sm font-bold text-foreground tabular-nums">
                            {fmt(data.liabilities)}
                        </span>
                    </div>
                    <Progress
                        value={(data.liabilities / total) * 100}
                        className="h-2"
                        indicatorClassName="bg-destructive"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            Total Equity
                        </span>
                        <span className="text-sm font-bold text-foreground tabular-nums">
                            {fmt(data.equity)}
                        </span>
                    </div>
                    <Progress
                        value={(Math.abs(data.equity) / total) * 100}
                        className="h-2"
                        indicatorClassName="bg-secondary"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Recent Transactions ────────────────────────────────
function RecentTransactionsCard({
    transactions,
}: {
    transactions: {
        id: string;
        number: string | null;
        type: string;
        description: string | null;
        amount: string;
        paidAt: string;
        status?: string;
        account: { accountName: string };
    }[];
}) {
    const navigate = useNavigate();
    const setSearch = useTransactionsFilterStore((s) => s.setSearch);

    const statusVariant = (s?: string) => {
        switch (s) {
            case 'posted':
                return 'success' as const;
            case 'voided':
            case 'reversed':
                return 'destructive' as const;
            default:
                return 'warning' as const;
        }
    };

    const handleClick = (tx: (typeof transactions)[number]) => {
        const term = tx.number || tx.description || tx.id;
        setSearch(term);
        navigate('/transactions');
    };

    return (
        <div className="card !p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">
                    Recent Transactions
                </h3>
                <Link
                    to="/transactions"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    View all <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
            {transactions.length === 0 ? (
                <div className="text-center py-8">
                    <Banknote className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No transactions yet
                    </p>
                    <Link to="/transactions">
                        <Button variant="outline" size="sm" className="mt-3">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add
                            transaction
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <button
                            key={tx.id}
                            onClick={() => handleClick(tx)}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors -mx-1 w-[calc(100%+0.5rem)] text-left cursor-pointer active:scale-[0.99]"
                        >
                            <div
                                className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                                    tx.type === 'income'
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : tx.type === 'expense'
                                            ? 'bg-red-100 dark:bg-red-900/30'
                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                )}
                            >
                                {tx.type === 'income' ? (
                                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : tx.type === 'expense' ? (
                                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                ) : (
                                    <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {tx.description || tx.account.accountName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(tx.paidAt), 'MMM d, yyyy')}{' '}
                                    &middot; {tx.account.accountName}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p
                                    className={cn(
                                        'text-sm font-medium tabular-nums',
                                        tx.type === 'income'
                                            ? 'text-green-600 dark:text-green-400'
                                            : tx.type === 'expense'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-foreground'
                                    )}
                                >
                                    {tx.type === 'income'
                                        ? '+'
                                        : tx.type === 'expense'
                                            ? '-'
                                            : ''}
                                    {fmt(Math.abs(Number(tx.amount)))}
                                </p>
                                <Badge
                                    variant={statusVariant(tx.status)}
                                    className="mt-0.5"
                                >
                                    {tx.status || 'pending'}
                                </Badge>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Unpaid Bills Card ──────────────────────────────────
function UnpaidBillsCard({
    bills,
}: {
    bills: {
        id: string;
        supplierName: string;
        dueDate: string;
        billAmount: number;
        openBalance: number;
        status: string;
    }[];
}) {
    const totalOutstanding = bills.reduce((s, b) => s + b.openBalance, 0);
    const overdue = bills.filter((b) => new Date(b.dueDate) < today);

    return (
        <div className="card !p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">
                    Unpaid Bills
                </h3>
                <Link
                    to="/expenses/bills"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    View all <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {bills.length === 0 ? (
                <div className="text-center py-8">
                    <Receipt className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No unpaid bills
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">
                                Outstanding
                            </p>
                            <p className="text-lg font-bold text-foreground tabular-nums">
                                {fmt(totalOutstanding)}
                            </p>
                        </div>
                        {overdue.length > 0 && (
                            <div className="flex-1 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    Overdue
                                </p>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">
                                    {overdue.length} bills
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2.5">
                        {bills.slice(0, 5).map((bill) => {
                            const isOverdue = new Date(bill.dueDate) < today;
                            return (
                                <div
                                    key={bill.id}
                                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors -mx-1"
                                >
                                    <div
                                        className={cn(
                                            'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                                            isOverdue
                                                ? 'bg-red-100 dark:bg-red-900/30'
                                                : 'bg-orange-100 dark:bg-orange-900/30'
                                        )}
                                    >
                                        <FileText
                                            className={cn(
                                                'w-4 h-4',
                                                isOverdue
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-orange-600 dark:text-orange-400'
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {bill.supplierName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Due{' '}
                                            {format(
                                                new Date(bill.dueDate),
                                                'MMM d, yyyy'
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-medium text-foreground tabular-nums">
                                            {fmt(bill.openBalance)}
                                        </p>
                                        {isOverdue && (
                                            <Badge
                                                variant="destructive"
                                                className="mt-0.5"
                                            >
                                                Overdue
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Quick Actions ──────────────────────────────────────
function QuickActionsCard() {
    const actions = [
        {
            label: 'Transaction',
            icon: <BadgeDollarSign className="w-4 h-4" />,
            to: '/transactions',
            bg: 'bg-primary/10 text-primary hover:bg-primary/20',
        },
        {
            label: 'Journal Entry',
            icon: <BookOpen className="w-4 h-4" />,
            to: '/journal-entries/new',
            bg: 'bg-accent text-accent-foreground hover:bg-accent/80',
        },
        {
            label: 'Bill',
            icon: <Receipt className="w-4 h-4" />,
            to: '/expenses/bills/new',
            bg: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
        },
        {
            label: 'Reports',
            icon: <FileText className="w-4 h-4" />,
            to: '/reports',
            bg: 'bg-accent/40 text-accent-foreground hover:bg-accent/60',
        },
        {
            label: 'Accounts',
            icon: <Landmark className="w-4 h-4" />,
            to: '/chart-of-accounts',
            bg: 'bg-muted text-muted-foreground hover:bg-muted/80',
        },
        {
            label: 'Contacts',
            icon: <CircleDollarSign className="w-4 h-4" />,
            to: '/expenses/contacts',
            bg: 'bg-secondary/10 text-secondary hover:bg-secondary/20',
        },
    ];

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {actions.map((action) => (
                <Link
                    key={action.label}
                    to={action.to}
                    className={cn(
                        'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95',
                        action.bg
                    )}
                >
                    {action.icon}
                    {action.label}
                </Link>
            ))}
        </div>
    );
}

// ─── Recent Journal Entries ─────────────────────────────
function RecentJournalEntriesCard({
    entries,
}: {
    entries: {
        id: string;
        entryNumber: string;
        entryDate: string;
        memo: string;
        totalDebit: number;
        status: string;
    }[];
}) {
    const statusVariant = (s: string) => {
        switch (s) {
            case 'posted':
                return 'success' as const;
            case 'voided':
                return 'destructive' as const;
            default:
                return 'warning' as const;
        }
    };

    return (
        <div className="card !p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">
                    Recent Journal Entries
                </h3>
                <Link
                    to="/journal-entries"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    View all <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
            {entries.length === 0 ? (
                <div className="text-center py-8">
                    <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No journal entries yet
                    </p>
                    <Link to="/journal-entries/new">
                        <Button variant="outline" size="sm" className="mt-3">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Create entry
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {entries.map((entry) => (
                        <Link
                            key={entry.id}
                            to={`/journal-entries/${entry.id}`}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors -mx-1"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/10 shrink-0">
                                <BookOpen className="w-4 h-4 text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    #{entry.entryNumber}{' '}
                                    {entry.memo ? `- ${entry.memo}` : ''}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(
                                        new Date(entry.entryDate),
                                        'MMM d, yyyy'
                                    )}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-medium text-foreground tabular-nums">
                                    {fmt(entry.totalDebit)}
                                </p>
                                <Badge
                                    variant={statusVariant(entry.status)}
                                    className="mt-0.5"
                                >
                                    {entry.status}
                                </Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════
export default function AdminDashboardKit() {
    const user = AuthStore((s) => s.user);
    const tenant = TenantStore((s) => s.selectedTenant);

    // Fetch all dashboard data
    const { data: plData, isLoading: plLoading } = useProfitLossReport({
        startDate: yearStart,
        endDate: todayStr,
    });
    const { data: bsData, isLoading: bsLoading } = useBalanceSheetReport({
        asOf: todayStr,
    });
    const { data: cfData, isLoading: cfLoading } = useCashFlowReport({
        startDate: yearStart,
        endDate: todayStr,
    });
    const { isLoading: ubLoading } = useUnpaidBillsReport({});
    const { data: txData, isLoading: txLoading } = useTransactions({
        page: 1,
        limit: 7,
        sort: 'paidAt',
        order: 'desc',
    });
    const { data: billsData, isLoading: billsLoading } = useBills({
        status: 'open',
        limit: 5,
        sort: 'dueDate',
        order: 'asc',
    });
    const { data: jeData, isLoading: jeLoading } = useJournalEntries({
        page: 1,
        limit: 5,
        sort: 'entryDate',
        order: 'desc',
    });

    // Derived values
    const pl = plData?.data;
    const bs = bsData?.data;
    const cf = cfData?.data;

    const income = pl?.totals?.income ?? 0;
    const expense = pl?.totals?.expense ?? 0;
    const netIncome = pl?.totals?.netIncome ?? 0;
    const cashBalance = bs?.totals?.assets ?? 0;
    const profitMargin = income > 0 ? netIncome / income : 0;

    const transactions = txData?.items ?? [];
    const unpaidBills = useMemo(() => {
        const items = billsData?.data?.items ?? [];
        return items.filter(
            (b) => b.status !== 'paid' && b.status !== 'voided'
        );
    }, [billsData]);
    const journalEntries = useMemo(() => {
        const raw = jeData?.data;
        if (!raw) return [];
        const list = (raw as unknown as { journalEntries?: unknown[] })
            ?.journalEntries;
        return Array.isArray(list)
            ? (list as {
                id: string;
                entryNumber: string;
                entryDate: string;
                memo: string;
                totalDebit: number;
                status: string;
            }[])
            : [];
    }, [jeData]);

    const firstName = user?.name?.split(' ')[0] || 'there';
    const greeting =
        today.getHours() < 12
            ? 'Good morning'
            : today.getHours() < 17
                ? 'Good afternoon'
                : 'Good evening';

    const anyLoading = plLoading || bsLoading || cfLoading;

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-foreground">
                        {greeting}, {firstName}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {tenant?.name ? `${tenant.name} \u00B7 ` : ''}
                        {format(today, 'EEEE, MMMM d, yyyy')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/journal-entries/new">
                        <Button variant="outline" size="sm">
                            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> New
                            Entry
                        </Button>
                    </Link>
                    <Link to="/reports">
                        <Button variant="default" size="sm">
                            <FileText className="w-3.5 h-3.5 mr-1.5" /> Reports
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActionsCard />

            {/* KPI Cards */}
            {anyLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiSkeleton />
                    <KpiSkeleton />
                    <KpiSkeleton />
                    <KpiSkeleton />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title="Total Income"
                        value={fmt(income)}
                        icon={
                            <TrendingUp className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                        }
                        iconBg="bg-green-100 dark:bg-green-900/30"
                        subtitle="Fiscal year to date"
                    />
                    <KpiCard
                        title="Total Expenses"
                        value={fmt(expense)}
                        icon={
                            <TrendingDown className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
                        }
                        iconBg="bg-red-100 dark:bg-red-900/30"
                        subtitle="Fiscal year to date"
                    />
                    <KpiCard
                        title="Net Income"
                        value={fmt(netIncome)}
                        icon={<Wallet className="w-4.5 h-4.5 text-primary" />}
                        iconBg="bg-primary/10"
                        trend={
                            income > 0
                                ? {
                                    value: profitMargin,
                                    label: 'profit margin',
                                }
                                : undefined
                        }
                        subtitle={income === 0 ? 'No data yet' : undefined}
                    />
                    <KpiCard
                        title="Total Assets"
                        value={fmt(cashBalance)}
                        icon={
                            <Landmark className="w-4.5 h-4.5 text-secondary" />
                        }
                        iconBg="bg-secondary/10"
                        subtitle="As of today"
                    />
                </div>
            )}

            {/* Charts Row */}
            {plLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ChartSkeleton height={280} />
                    <ChartSkeleton height={280} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <IncomeExpenseChart
                            incomeItems={pl?.breakdown?.income ?? []}
                            expenseItems={pl?.breakdown?.expense ?? []}
                        />
                    </div>
                    <ExpenseDonutChart items={pl?.breakdown?.expense ?? []} />
                </div>
            )}

            {/* Transactions + Unpaid Bills Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    {txLoading ? (
                        <TableSkeleton />
                    ) : (
                        <RecentTransactionsCard transactions={transactions} />
                    )}
                </div>
                <div>
                    {billsLoading || ubLoading ? (
                        <TableSkeleton rows={4} />
                    ) : (
                        <UnpaidBillsCard bills={unpaidBills} />
                    )}
                </div>
            </div>

            {/* Bottom Row: Cash Flow + Balance Sheet + Journal Entries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    {cfLoading ? (
                        <TableSkeleton rows={3} />
                    ) : cf ? (
                        <CashFlowCard data={cf} />
                    ) : (
                        <TableSkeleton rows={3} />
                    )}
                </div>
                <div>
                    {bsLoading ? (
                        <TableSkeleton rows={3} />
                    ) : bs ? (
                        <BalanceSheetCard data={bs.totals} />
                    ) : (
                        <TableSkeleton rows={3} />
                    )}
                </div>
                <div>
                    {jeLoading ? (
                        <TableSkeleton rows={4} />
                    ) : (
                        <RecentJournalEntriesCard entries={journalEntries} />
                    )}
                </div>
            </div>
        </div>
    );
}
