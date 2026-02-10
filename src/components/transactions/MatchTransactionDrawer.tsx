import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Input from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useBills } from '@/services/apis/billsApi';
import { useMatchTransaction } from '@/services/apis/transactions';
import type { Bill } from '@/types/bill';
import type { BankTransaction } from '@/utils/transactionUtils';
import { currency } from '@/utils/transactionUtils';
import {
    CalendarIcon,
    ChevronRightIcon,
    FilterIcon,
    SearchIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const RECORD_TYPES = [
    { value: 'bill', label: 'Bill' },
    { value: 'invoice', label: 'Invoice' },
];

const DATE_RANGES = [
    { value: 'custom', label: 'Custom' },
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'last_3_months', label: 'Last 3 months' },
];

function formatDisplayDate(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

interface MatchTransactionDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: BankTransaction | null;
    onSuccess?: () => void;
}

export function MatchTransactionDrawer({
    open,
    onOpenChange,
    transaction,
    onSuccess,
}: MatchTransactionDrawerProps) {
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState('custom');
    const [recordType, setRecordType] = useState<string>('bill');
    const [billDateFrom, setBillDateFrom] = useState<string>('');
    const [billDateTo, setBillDateTo] = useState<string>('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [paymentAmounts, setPaymentAmounts] = useState<
        Record<string, string>
    >({});
    const [resolveOpen, setResolveOpen] = useState(false);
    const [billsPage, setBillsPage] = useState(1);
    const limit = 10;

    const { mutate: matchTransaction, isPending } = useMatchTransaction();

    useEffect(() => {
        if (dateRange === 'custom') return;
        const now = new Date();
        let from: string;
        let to: string;
        if (dateRange === 'this_month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString()
                .split('T')[0];
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                .toISOString()
                .split('T')[0];
        } else if (dateRange === 'last_month') {
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                .toISOString()
                .split('T')[0];
            to = new Date(now.getFullYear(), now.getMonth(), 0)
                .toISOString()
                .split('T')[0];
        } else if (dateRange === 'last_3_months') {
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                .toISOString()
                .split('T')[0];
            from = new Date(now.getFullYear(), now.getMonth() - 2, 1)
                .toISOString()
                .split('T')[0];
        } else {
            return;
        }
        setBillDateFrom(from);
        setBillDateTo(to);
    }, [dateRange]);

    const billParams = useMemo(
        () => ({
            page: billsPage,
            limit,
            status: 'open' as const,
            ...(billDateFrom && { billDateFrom }),
            ...(billDateTo && { billDateTo }),
            sort: 'documentDate' as const,
            order: 'desc' as const,
        }),
        [billsPage, billDateFrom, billDateTo]
    );

    const { data: billsData } = useBills(billParams);
    const bills = useMemo(
        () => billsData?.data?.items ?? [],
        [billsData?.data?.items]
    );
    const pagination = billsData?.data?.pagination;
    const totalItems = pagination?.total ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    const filteredBills = useMemo(() => {
        if (!search.trim()) return bills;
        const q = search.toLowerCase();
        return bills.filter(
            (b) =>
                b.supplierName?.toLowerCase().includes(q) ||
                b.id?.toLowerCase().includes(q)
        );
    }, [bills, search]);

    const bankAmount =
        transaction != null
            ? Math.abs(transaction.spent ?? transaction.received ?? 0)
            : 0;

    const selectedAmount = useMemo(() => {
        let sum = 0;
        selectedIds.forEach((id) => {
            const val = paymentAmounts[id];
            if (val) {
                const n = parseFloat(val);
                if (!Number.isNaN(n)) sum += n;
            }
        });
        return sum;
    }, [selectedIds, paymentAmounts]);

    const difference = bankAmount - selectedAmount;

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const setPayment = (id: string, value: string) => {
        setPaymentAmounts((prev) => ({ ...prev, [id]: value }));
    };

    const matchCompletedRef = useRef(0);

    const handleMatch = () => {
        if (!transaction) return;
        const toMatch: Array<{ targetId: string; matchAmount: number }> = [];
        selectedIds.forEach((id) => {
            const val = paymentAmounts[id];
            const n = val ? parseFloat(val) : 0;
            if (!Number.isNaN(n) && n > 0)
                toMatch.push({ targetId: id, matchAmount: n });
        });

        if (toMatch.length === 0) return;

        matchCompletedRef.current = 0;
        const total = toMatch.length;
        toMatch.forEach((item, index) => {
            matchTransaction(
                {
                    transactionId: transaction.id,
                    payload: {
                        module: 'bills',
                        targetId: item.targetId,
                        matchAmount: item.matchAmount,
                        matchType: 'payment',
                        reconcile: index === total - 1,
                    },
                },
                {
                    onSuccess: () => {
                        matchCompletedRef.current += 1;
                        if (matchCompletedRef.current >= total) {
                            onSuccess?.();
                            onOpenChange(false);
                        }
                    },
                }
            );
        });
    };

    const clearDateFilter = () => {
        setBillDateFrom('');
        setBillDateTo('');
    };

    const hasDateFilter = billDateFrom || billDateTo;
    const dateFilterLabel =
        billDateFrom && billDateTo
            ? `Date: ${formatDisplayDate(billDateFrom)}–${formatDisplayDate(billDateTo)}`
            : billDateFrom
                ? `Date: from ${formatDisplayDate(billDateFrom)}`
                : billDateTo
                    ? `Date: to ${formatDisplayDate(billDateTo)}`
                    : '';

    if (!transaction) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex h-full w-[100vw] sm:max-w-none flex-col gap-0 overflow-hidden border-l bg-background p-0"
            >
                {/* Header */}
                <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-4 pr-8">
                        <SheetTitle className="text-lg font-medium">
                            Find other matches
                        </SheetTitle>
                        <a
                            href="#"
                            className="text-sm text-primary underline underline-offset-2 hover:no-underline"
                        >
                            Give feedback
                        </a>
                    </div>
                </SheetHeader>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Transaction to match */}
                    <section className="border-b px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-base font-bold text-foreground">
                                    {transaction.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {transaction.description}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {formatDisplayDate(transaction.date)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {transaction.received != null &&
                                        transaction.received > 0
                                        ? 'Received'
                                        : 'Spent'}
                                </p>
                                <p
                                    className={`text-xl font-bold ${(transaction.received ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {(transaction.received ?? 0) > 0 ? '' : '-'}
                                    {currency(bankAmount)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Find and select records */}
                    <section className="flex flex-col flex-1 overflow-hidden px-6 py-4">
                        <h3 className="mb-3 text-sm font-medium text-foreground">
                            Find and select record(s) to match
                        </h3>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative min-w-[200px] flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9 pl-9 pr-9"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-muted"
                                    >
                                        <XIcon className="size-4" />
                                    </button>
                                )}
                            </div>
                            <Select
                                value={dateRange}
                                onValueChange={setDateRange}
                            >
                                <SelectTrigger className="h-9 w-[140px]">
                                    <CalendarIcon className="size-4 shrink-0" />
                                    <SelectValue placeholder="Date range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DATE_RANGES.map((r) => (
                                        <SelectItem
                                            key={r.value}
                                            value={r.value}
                                        >
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={recordType}
                                onValueChange={setRecordType}
                            >
                                <SelectTrigger className="h-9 w-[140px]">
                                    <SelectValue placeholder="Record type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RECORD_TYPES.map((r) => (
                                        <SelectItem
                                            key={r.value}
                                            value={r.value}
                                        >
                                            {r.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-1"
                            >
                                <FilterIcon className="size-4" />
                                Filters
                            </Button>
                        </div>

                        {hasDateFilter && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs">
                                    {dateFilterLabel}
                                    <button
                                        type="button"
                                        onClick={clearDateFilter}
                                        className="rounded hover:bg-muted"
                                    >
                                        <XIcon className="size-3.5" />
                                    </button>
                                </span>
                            </div>
                        )}

                        {/* Records table */}
                        <div className="mt-4 flex flex-1 flex-col overflow-hidden rounded-md border">
                            <div className="overflow-auto">
                                <table className="w-full table-fixed text-sm">
                                    <thead className="sticky top-0 z-10 border-b bg-muted/50">
                                        <tr>
                                            <th className="w-10 px-3 py-2 text-left font-medium">
                                                <span className="sr-only">
                                                    Select
                                                </span>
                                            </th>
                                            <th className="w-24 px-3 py-2 text-left font-medium">
                                                DATE ↑
                                            </th>
                                            <th className="w-20 px-3 py-2 text-left font-medium">
                                                TYPE
                                            </th>
                                            <th className="w-24 px-3 py-2 text-left font-medium">
                                                REF NO.
                                            </th>
                                            <th className="min-w-[100px] px-3 py-2 text-left font-medium">
                                                PAYEE
                                            </th>
                                            <th className="w-28 px-3 py-2 text-right font-medium">
                                                TRANSACTION AMOUNT
                                            </th>
                                            <th className="w-28 px-3 py-2 text-right font-medium">
                                                OPEN BALANCE
                                            </th>
                                            <th className="w-28 px-3 py-2 text-left font-medium">
                                                PAYMENT
                                            </th>
                                        </tr>
                                    </thead>
                                    <TableBody
                                        bills={filteredBills}
                                        selectedIds={selectedIds}
                                        paymentAmounts={paymentAmounts}
                                        onToggleSelect={toggleSelect}
                                        onPaymentChange={setPayment}
                                    />
                                </table>
                            </div>
                            <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                <span>
                                    {filteredBills.length > 0
                                        ? `1 - ${Math.min(limit, filteredBills.length)} of ${totalItems} items`
                                        : '0 items'}
                                </span>
                                <span>
                                    Page {billsPage} of {totalPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6"
                                    disabled={billsPage <= 1}
                                    onClick={() =>
                                        setBillsPage((p) => Math.max(1, p - 1))
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6"
                                    disabled={billsPage >= totalPages}
                                    onClick={() =>
                                        setBillsPage((p) =>
                                            Math.min(totalPages, p + 1)
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        {/* Summary + Resolve */}
                        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                            <Collapsible
                                open={resolveOpen}
                                onOpenChange={setResolveOpen}
                            >
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        <ChevronRightIcon
                                            className={`size-4 transition-transform ${resolveOpen ? 'rotate-90' : ''}`}
                                        />
                                        If needed, resolve the difference
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="mt-2 rounded border bg-muted/30 p-3 text-sm text-muted-foreground">
                                        Options for handling the remaining
                                        difference (e.g. bank fee, rounding) can
                                        be added here.
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>

                            <div className="text-right text-sm">
                                <p>
                                    <span className="text-muted-foreground">
                                        Bank transaction amount:{' '}
                                    </span>
                                    <span className="font-medium">
                                        {currency(bankAmount)}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Selected amount:{' '}
                                    </span>
                                    <span className="font-medium">
                                        {currency(selectedAmount)}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-muted-foreground">
                                        Difference:{' '}
                                    </span>
                                    <span
                                        className={`font-medium ${difference === 0 ? 'text-green-600' : 'text-foreground'}`}
                                    >
                                        {currency(difference)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <SheetFooter className="flex flex-row items-center justify-between border-t px-6 py-4">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="text-sm text-primary underline underline-offset-2 hover:no-underline"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={handleMatch}
                        disabled={
                            isPending ||
                            selectedIds.size === 0 ||
                            selectedAmount <= 0
                        }
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isPending ? 'Matching...' : 'Match'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function TableBody({
    bills,
    selectedIds,
    paymentAmounts,
    onToggleSelect,
    onPaymentChange,
}: {
    bills: Bill[];
    selectedIds: Set<string>;
    paymentAmounts: Record<string, string>;
    onToggleSelect: (id: string) => void;
    onPaymentChange: (id: string, value: string) => void;
}) {
    if (bills.length === 0) {
        return (
            <tbody>
                <tr>
                    <td
                        colSpan={8}
                        className="px-3 py-8 text-center text-sm text-muted-foreground"
                    >
                        No records found. Try adjusting search or filters.
                    </td>
                </tr>
            </tbody>
        );
    }
    return (
        <tbody>
            {bills.map((bill) => (
                <tr
                    key={bill.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                >
                    <td className="w-10 px-3 py-2">
                        <Checkbox
                            checked={selectedIds.has(bill.id)}
                            onCheckedChange={() => onToggleSelect(bill.id)}
                        />
                    </td>
                    <td className="w-24 px-3 py-2 text-muted-foreground">
                        {formatDisplayDate(bill.billDate ?? bill.dueDate)}
                    </td>
                    <td className="w-20 px-3 py-2">
                        <span className="text-primary">Bill</span>
                    </td>
                    <td className="w-24 truncate px-3 py-2 font-mono text-xs">
                        {bill.id.slice(0, 8)}
                    </td>
                    <td className="min-w-[100px] truncate px-3 py-2">
                        {bill.supplierName ?? '—'}
                    </td>
                    <td className="w-28 px-3 py-2 text-right">
                        {currency(bill.billAmount)}
                    </td>
                    <td className="w-28 px-3 py-2 text-right">
                        {currency(bill.openBalance)}
                    </td>
                    <td className="w-28 px-3 py-2">
                        <Input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="0"
                            className="h-8 w-full text-sm"
                            value={paymentAmounts[bill.id] ?? ''}
                            onChange={(e) =>
                                onPaymentChange(bill.id, e.target.value)
                            }
                        />
                    </td>
                </tr>
            ))}
        </tbody>
    );
}
