import { Icons } from '@/components/shared/Icons';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableFooter,
    TableHead,
    TableHeader,
    TableLoadingState,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
} from '@/components/ui/table';
import {
    useBills,
    useRecordBillPayment,
    useReverseBillPayment,
} from '@/services/apis/billsApi';
import { Bill, BillSortField } from '@/types/bill';
import { cn } from '@/utils/cn';
import {
    AlertCircle,
    Calendar,
    ChevronDown,
    Download,
    MessageSquare,
    Printer,
    Settings2,
    SlidersHorizontal,
    Upload,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

/** API status values for the three filter tabs */
type StatusFilterTab = 'draft' | 'open' | 'paid';

const STATUS_TABS: { key: StatusFilterTab; label: string }[] = [
    { key: 'draft', label: 'For review' },
    { key: 'open', label: 'Unpaid' },
    { key: 'paid', label: 'Paid' },
];

const BILL_SORT_KEYS: BillSortField[] = [
    'documentDate',
    'dueDate',
    'totalAmount',
    'createdAt',
    'updatedAt',
];

const BILL_DATE_PRESETS: { label: string; from: string; to: string }[] = [
    { label: 'This Year', from: '', to: '' },
    { label: 'Last 30 days', from: '', to: '' },
    { label: 'Last 90 days', from: '', to: '' },
];

function getBillDateRangeForYear(): { from: string; to: string } {
    const y = new Date().getFullYear();
    return {
        from: `${y}-01-01`,
        to: `${y}-12-31`,
    };
}

function formatBillStatus(bill: Bill): {
    label: string;
    subLabel: string;
    className: string;
    icon: typeof AlertCircle;
} {
    if (bill.status === 'paid' || bill.status === 'voided') {
        return {
            label: bill.status === 'voided' ? 'Voided' : 'Paid',
            subLabel: '',
            className: 'text-muted-foreground',
            icon: AlertCircle,
        };
    }
    if (bill.status === 'draft') {
        return {
            label: 'Draft',
            subLabel: '',
            className: 'text-muted-foreground',
            icon: Calendar,
        };
    }
    const due = new Date(bill.dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
    if (diffDays < 0) {
        const daysAgo = Math.abs(diffDays);
        return {
            label: 'Overdue',
            subLabel: `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`,
            className: 'text-amber-600 dark:text-amber-500',
            icon: AlertCircle,
        };
    }
    if (diffDays === 0) {
        return {
            label: 'Due today',
            subLabel: '',
            className: 'text-amber-600 dark:text-amber-500',
            icon: AlertCircle,
        };
    }
    return {
        label: 'Due later',
        subLabel: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        className: 'text-muted-foreground',
        icon: Calendar,
    };
}

const Billspage = () => {
    const [statusTab, setStatusTab] = useState<StatusFilterTab>('open');
    const [supplierId, setSupplierId] = useState<string>('all');
    const [billDatePreset, setBillDatePreset] = useState('This Year');
    const [page, setPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [sortKey, setSortKey] = useState<BillSortField>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const limit = 10;
    const billDateRange = useMemo(() => {
        if (billDatePreset === 'This Year') return getBillDateRangeForYear();
        const now = new Date();
        if (billDatePreset === 'Last 30 days') {
            const from = new Date(now);
            from.setDate(from.getDate() - 30);
            return {
                from: from.toISOString().slice(0, 10),
                to: now.toISOString().slice(0, 10),
            };
        }
        if (billDatePreset === 'Last 90 days') {
            const from = new Date(now);
            from.setDate(from.getDate() - 90);
            return {
                from: from.toISOString().slice(0, 10),
                to: now.toISOString().slice(0, 10),
            };
        }
        return getBillDateRangeForYear();
    }, [billDatePreset]);

    const queryParams = useMemo(
        () => ({
            page,
            limit,
            status: statusTab,
            supplierId: supplierId === 'all' ? undefined : supplierId,
            billDateFrom: billDateRange.from,
            billDateTo: billDateRange.to,
            sort: sortKey,
            order: sortOrder,
        }),
        [page, limit, statusTab, supplierId, billDateRange, sortKey, sortOrder]
    );

    const { data, isLoading, isError } = useBills(queryParams);
    const recordPayment = useRecordBillPayment();
    const reversePayment = useReverseBillPayment();

    const bills = useMemo(() => data?.data?.items ?? [], [data?.data?.items]);
    const pagination = data?.data?.pagination;
    const totals = data?.data?.totals;
    const totalItems = pagination?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const rowIds = bills.map((b) => b.id);

    const totalBillAmount = useMemo(
        () => bills.reduce((sum, b) => sum + b.billAmount, 0),
        [bills]
    );
    const totalOpenBalance = useMemo(
        () => bills.reduce((sum, b) => sum + b.openBalance, 0),
        [bills]
    );

    const clearBillDateFilter = useCallback(() => {
        setBillDatePreset('This Year');
    }, []);

    const handleMarkAsPaid = useCallback(
        (bill: Bill) => {
            recordPayment.mutate({
                id: bill.id,
                payload: {
                    amount: bill.openBalance,
                    paymentDate: new Date().toISOString().slice(0, 10),
                },
            });
        },
        [recordPayment]
    );

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

    const hasBillDateFilter = billDatePreset !== 'This Year' || true;
    const filterTagLabel = `Bill Date: ${formatDate(billDateRange.from)}-${formatDate(billDateRange.to)}`;

    return (
        <div className="flex flex-col gap-4">
            {/* Section header: Bills + filter tabs + actions */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-primary">Bills</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary gap-1.5"
                        >
                            <MessageSquare className="size-4" />
                            Give feedback
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 border-primary text-primary hover:bg-primary/10"
                                >
                                    Pay bills
                                    <ChevronDown className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() =>
                                        selectedItems.length > 0 &&
                                        selectedItems.forEach((id) => {
                                            const bill = bills.find(
                                                (b) => b.id === id
                                            );
                                            if (bill) handleMarkAsPaid(bill);
                                        })
                                    }
                                    disabled={selectedItems.length === 0}
                                >
                                    Pay selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex rounded-md border border-primary shadow-sm">
                            <Button
                                size="sm"
                                asChild
                                className="rounded-r-none border-r border-primary/30 px-4"
                            >
                                <Link to="/expenses/bills/new">Add bill</Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="rounded-l-none px-2 border-0"
                                        aria-label="Add bill options"
                                    >
                                        <ChevronDown className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link to="/expenses/bills/new">
                                            Create bill
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {}}
                                        className="gap-2"
                                    >
                                        <Upload className="size-4" />
                                        Upload from computer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/expenses/bills/recurring">
                                            Create recurring bill
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {}}
                                        className="gap-2"
                                    >
                                        <SlidersHorizontal className="size-4" />
                                        Customize
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Filter tabs: For review, Unpaid, Paid */}
                <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setStatusTab(tab.key)}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                                statusTab === tab.key
                                    ? 'bg-background text-primary shadow-sm border border-border'
                                    : 'text-muted-foreground hover:text-primary'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters row: Supplier, Bill Date + active filter tag */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-[180px]">
                        <Select
                            value={supplierId}
                            onValueChange={setSupplierId}
                        >
                            <SelectTrigger size="default">
                                <SelectValue placeholder="Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {/* Suppliers could be from useContacts type=supplier */}
                                <SelectItem value="1">Vaibhav Inc.</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[180px]">
                        <Select
                            value={billDatePreset}
                            onValueChange={setBillDatePreset}
                        >
                            <SelectTrigger size="default">
                                <SelectValue placeholder="Bill Date" />
                            </SelectTrigger>
                            <SelectContent>
                                {BILL_DATE_PRESETS.map((p) => (
                                    <SelectItem key={p.label} value={p.label}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {hasBillDateFilter && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-sm text-primary">
                            {filterTagLabel}
                            <button
                                type="button"
                                onClick={clearBillDateFilter}
                                className="p-0.5 rounded hover:bg-muted-foreground/20"
                                aria-label="Remove filter"
                            >
                                <Icons.Close className="size-3.5" />
                            </button>
                        </span>
                    </div>
                )}
            </div>

            {/* Toolbar: Print, Export, Customize */}
            <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" className="size-8">
                    <Printer className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                    <Download className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                >
                    <Settings2 className="size-4" />
                    Customize
                </Button>
            </div>

            {/* Table */}
            <Table
                enableSelection
                rowIds={rowIds}
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
                sortKey={sortKey}
                sortDirection={sortOrder}
                onSortChange={(key, dir) => {
                    if (BILL_SORT_KEYS.includes(key as BillSortField)) {
                        setSortKey(key as BillSortField);
                        setSortOrder(dir === 'desc' ? 'desc' : 'asc');
                    }
                }}
            >
                <TableSelectionToolbar>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                            selectedItems.forEach((id) => {
                                const bill = bills.find((b) => b.id === id);
                                if (bill) handleMarkAsPaid(bill);
                            })
                        }
                        disabled={selectedItems.length === 0}
                    >
                        Pay selected
                    </Button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead>SUPPLIER</TableHead>
                        <TableHead sortable sortKey="dueDate">
                            DUE DATE
                        </TableHead>
                        <TableHead sortable sortKey="totalAmount">
                            BILL AMOUNT
                        </TableHead>
                        <TableHead>OPEN BALANCE</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead align="right">ACTION</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableLoadingState colSpan={7} />
                    ) : isError ? (
                        <TableEmptyState
                            colSpan={7}
                            message="Failed to load bills"
                            description="Please try again later"
                        />
                    ) : bills.length === 0 ? (
                        <TableEmptyState
                            colSpan={7}
                            message="No bills found"
                            description="Try adjusting your filters or add a bill"
                        />
                    ) : (
                        bills.map((bill) => {
                            const statusInfo = formatBillStatus(bill);
                            return (
                                <TableRow key={bill.id} rowId={bill.id}>
                                    <TableCell>
                                        <TableRowCheckbox rowId={bill.id} />
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            to={`/expenses/bills/${bill.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {bill.supplierName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-primary/80">
                                            {formatDate(bill.dueDate)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {CURRENCY_FORMAT.format(
                                            bill.billAmount
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {CURRENCY_FORMAT.format(
                                            bill.openBalance
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className={cn(
                                                'flex items-center gap-1.5',
                                                statusInfo.className
                                            )}
                                        >
                                            <statusInfo.icon className="size-4 shrink-0" />
                                            <span className="font-medium">
                                                {statusInfo.label}
                                            </span>
                                            {statusInfo.subLabel && (
                                                <span className="text-muted-foreground">
                                                    {statusInfo.subLabel}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1 text-primary h-8"
                                                >
                                                    {bill.status === 'paid' ||
                                                    bill.status === 'voided'
                                                        ? 'View'
                                                        : 'Mark as paid'}
                                                    <ChevronDown className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {bill.status !== 'paid' &&
                                                    bill.status !==
                                                        'voided' && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleMarkAsPaid(
                                                                    bill
                                                                )
                                                            }
                                                            disabled={
                                                                recordPayment.isPending
                                                            }
                                                        >
                                                            Mark as paid
                                                        </DropdownMenuItem>
                                                    )}
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        to={`/expenses/bills/${bill.id}`}
                                                    >
                                                        View details
                                                    </Link>
                                                </DropdownMenuItem>
                                                {bill.status === 'paid' && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            reversePayment.mutate(
                                                                bill.id
                                                            )
                                                        }
                                                        disabled={
                                                            reversePayment.isPending
                                                        }
                                                    >
                                                        Reverse payment
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
                {(totals || bills.length > 0) && (
                    <TableFooter>
                        <tr>
                            <TableCell
                                colSpan={3}
                                className="font-medium text-primary"
                            >
                                Total
                            </TableCell>
                            <TableCell className="font-medium">
                                {CURRENCY_FORMAT.format(
                                    totals?.billAmount ?? totalBillAmount
                                )}
                            </TableCell>
                            <TableCell className="font-medium">
                                {CURRENCY_FORMAT.format(
                                    totals?.openBalance ?? totalOpenBalance
                                )}
                            </TableCell>
                            <TableCell colSpan={2} />
                        </tr>
                    </TableFooter>
                )}
            </Table>

            {/* Pagination */}
            {totalItems > 0 && (
                <TablePagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={limit}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
};

export default Billspage;
