import Button from '@/components/typography/Button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableEmptyState,
    TableHead,
    TableHeader,
    TablePagination,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar
} from '@/components/ui/table';
import { useEffect, useMemo, useState } from 'react';
import { FaFileInvoiceDollar, FaFilter, FaSearch } from 'react-icons/fa';
import { useTaxes } from '../../services/apis/taxApi';
import { showSuccessToast } from '../../utills/toast';

const Transactionpage = () => {
    type TxStatus = 'pending' | 'posted' | 'excluded';
    type BankTransaction = {
        id: string;
        date: string;
        description: string;
        spent?: number;
        received?: number;
        tax?: number;
        taxId?: string;
        taxRate?: number;
        fromTo?: string;
        category?: string;
        matched?: boolean;
        status: TxStatus;
        account: string;
    };

    const [activeTab, setActiveTab] = useState<TxStatus>('pending');
    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;
    const [sortKey, setSortKey] = useState<keyof BankTransaction>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const DEFAULT_TAX_RATE = 0.13;
    const [transactions, setTransactions] = useState<BankTransaction[]>(() => [
        {
            id: '1',
            date: '2025-09-02',
            description: 'Canada Post',
            spent: 99.33,
            tax: Number((99.33 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'pending',
            account: 'RBC Visa Business 5599',
            category: 'Postage & Courier',
        },
        {
            id: '2',
            date: '2025-09-14',
            description: 'Canada Post',
            spent: 35.56,
            tax: Number((35.56 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'pending',
            account: 'RBC Visa Business 5599',
            category: 'Postage & Courier',
        },
        {
            id: '3',
            date: '2025-09-21',
            description: 'Canada Post',
            spent: 79.42,
            tax: Number((79.42 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'pending',
            account: 'RBC Visa Business 5599',
            category: 'Postage & Courier',
        },
        {
            id: '4',
            date: '2025-10-02',
            description: 'Canada Post',
            spent: 737.65,
            tax: Number((737.65 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'posted',
            account: 'RBC Visa Business 5599',
            category: 'Postage & Courier',
        },
        {
            id: '5',
            date: '2025-10-12',
            description: 'Canada Post',
            spent: 793.95,
            tax: Number((793.95 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'pending',
            account: 'RBC Visa Business 5599',
            category: 'Postage & Courier',
        },
        {
            id: '6',
            date: '2025-10-23',
            description: 'Canada Post',
            spent: 35.82,
            tax: Number((35.82 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'excluded',
            account: 'RBC Visa Business 5599',
            category: 'Postage & Courier',
        },
        {
            id: '7',
            date: '2025-10-25',
            description: 'Stripe Payout',
            received: 1200.0,
            tax: 0,
            status: 'posted',
            account: 'RBC Business Operating',
            category: 'Income',
        },
        {
            id: '8',
            date: '2025-10-28',
            description: 'Office Depot',
            spent: 153.79,
            tax: Number((153.79 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'pending',
            account: 'RBC Business Operating',
            category: 'Office Supplies',
        },
        {
            id: '9',
            date: '2025-11-02',
            description: 'Google Workspace',
            spent: 18.0,
            tax: Number((18.0 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'pending',
            account: 'RBC Visa Business 5599',
            category: 'Software',
        },
        {
            id: '10',
            date: '2025-11-18',
            description: 'Canada Post',
            spent: 19.99,
            tax: Number((19.99 * DEFAULT_TAX_RATE).toFixed(2)),
            status: 'posted',
            account: 'RBC Visa Business 5599',
            category: 'Postage & Courier',
        },
    ]);

    const SUPPLIER_OPTIONS: ComboboxOption[] = useMemo(() => {
        const uniqueSuppliers = new Set<string>([
            'Canada Post',
            'Office Depot',
            'Stripe',
            'Google Workspace',
            'Amazon',
            'Staples',
            'Apple',
            'Air Canada',
            'Microsoft',
            'Walmart',
        ]);
        transactions.forEach((t) => {
            if (t.description) uniqueSuppliers.add(t.description);
            if (t.fromTo) uniqueSuppliers.add(t.fromTo);
        });
        return Array.from(uniqueSuppliers).map((s) => ({
            value: s,
            label: s,
        }));
    }, [transactions]);
    const CATEGORY_OPTIONS: ComboboxOption[] = useMemo(
        () => [
            { value: 'Postage & Courier', label: 'Postage & Courier' },
            { value: 'Continuing Education', label: 'Continuing Education' },
            { value: 'Office Supplies', label: 'Office Supplies' },
            { value: 'Software', label: 'Software' },
            { value: 'Utilities', label: 'Utilities' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Travel', label: 'Travel' },
            { value: 'Meals', label: 'Meals' },
            { value: 'Rent', label: 'Rent' },
            { value: 'Insurance', label: 'Insurance' },
            { value: 'Income', label: 'Income' },
        ],
        []
    );

    const filtered = useMemo(() => {
        return transactions.filter(
            (t) =>
                t.status === activeTab &&
                (search
                    ? `${t.date} ${t.description} ${t.account} ${t.fromTo || ''} ${
                          t.category || ''
                      }`
                          .toLowerCase()
                          .includes(search.toLowerCase())
                    : true)
        );
    }, [transactions, activeTab, search]);

    const { data: taxesResponse } = useTaxes({ isActive: true, limit: 100 });
    const TAX_OPTIONS: ComboboxOption[] = useMemo(() => {
        const taxes = taxesResponse?.data?.items || [];
        return taxes.map((t) => ({
            value: t.id,
            label: `${t.name} (${(t.rate * 100).toFixed(2)}%)`,
        }));
    }, [taxesResponse]);
    const TAX_RATE_BY_ID: Record<string, number> = useMemo(() => {
        const taxes = taxesResponse?.data?.items || [];
        const map: Record<string, number> = {};
        taxes.forEach((t) => {
            map[t.id] = t.rate;
        });
        return map;
    }, [taxesResponse]);
    useEffect(() => {
        const defaultTax =
            taxesResponse?.data?.items?.find((t) => t.isActive) ||
            taxesResponse?.data?.items?.[0];
        if (!defaultTax) return;
        setTransactions((prev) =>
            prev.map((tx) => {
                if (!tx.taxId && tx.spent) {
                    const rate = defaultTax.rate;
                    const taxAmount = Number((tx.spent * rate).toFixed(2));
                    return {
                        ...tx,
                        taxId: defaultTax.id,
                        taxRate: rate,
                        tax: taxAmount,
                    };
                }
                return tx;
            })
        );
    }, [taxesResponse]);

    const sorted = useMemo(() => {
        const order = sortDirection === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const va = a[sortKey];
            const vb = b[sortKey];
            if (sortKey === 'date') {
                const da = new Date(String(va)).getTime();
                const db = new Date(String(vb)).getTime();
                return (da - db) * order;
            }
            if (sortKey === 'spent' || sortKey === 'received' || sortKey === 'tax') {
                const na = Number(va || 0);
                const nb = Number(vb || 0);
                return (na - nb) * order;
            }
            return String(va || '').localeCompare(String(vb || '')) * order;
        });
    }, [filtered, sortKey, sortDirection]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const pageData = sorted.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const currency = (n?: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(n || 0);

    const pendingCount = transactions.filter(
        (t) => t.status === 'pending'
    ).length;
    const postedCount = transactions.filter(
        (t) => t.status === 'posted'
    ).length;
    const excludedCount = transactions.filter(
        (t) => t.status === 'excluded'
    ).length;

    const totalIncome = transactions
        .filter((t) => t.received)
        .reduce((sum, t) => sum + (t.received || 0), 0);
    const totalExpenses = transactions
        .filter((t) => t.spent)
        .reduce((sum, t) => sum + (t.spent || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2 shadow-sm border border-primary/10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-primary/50 uppercase">
                                Total Income
                            </p>
                            <p className="text-lg font-bold text-primary">
                                {currency(totalIncome)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2 shadow-sm border border-primary/10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-primary/50 uppercase">
                                Total Expenses
                            </p>
                            <p className="text-lg font-bold text-primary">
                                {currency(totalExpenses)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2 shadow-sm border border-primary/10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-primary/50 uppercase">
                                This Month
                            </p>
                            <p className="text-lg font-bold text-primary">
                                {currency(totalIncome - totalExpenses)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2 shadow-sm border border-primary/10 p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FaFileInvoiceDollar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-primary/50 uppercase">
                                Total Count
                            </p>
                            <p className="text-lg font-bold text-primary">
                                {transactions.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2 border border-primary/10">
                <div className="p-4 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                        <button
                            className={`px-3 py-1.5 rounded-2 text-sm ${
                                activeTab === 'pending'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-primary/10 text-primary'
                            }`}
                            onClick={() => {
                                setActiveTab('pending');
                                setPage(1);
                            }}
                        >
                            Pending ({pendingCount})
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-2 text-sm ${
                                activeTab === 'posted'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-primary/10 text-primary'
                            }`}
                            onClick={() => {
                                setActiveTab('posted');
                                setPage(1);
                            }}
                        >
                            Posted ({postedCount})
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-2 text-sm ${
                                activeTab === 'excluded'
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-primary/10 text-primary'
                            }`}
                            onClick={() => {
                                setActiveTab('excluded');
                                setPage(1);
                            }}
                        >
                            Excluded ({excludedCount})
                        </button>
                        <div className="ml-auto flex items-center gap-3">
                            <div className="relative w-[260px]">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 w-4 h-4" />
                                <input
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search"
                                    className="w-full pl-10 pr-4 py-2 border border-primary/10 rounded-2 text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <FaFilter className="mr-2" /> Filters
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <Table
                        enableSelection={true}
                        onSelectionChange={setSelectedItems}
                        rowIds={pageData.map((t) => t.id)}
                        selectedIds={selectedItems}
                        sortKey={sortKey}
                        sortDirection={sortDirection}
                        onSortChange={(key, direction) => {
                            if (direction) {
                                setSortKey(key as keyof BankTransaction);
                                setSortDirection(direction);
                            } else {
                                setSortKey('date');
                                setSortDirection('asc');
                            }
                            setPage(1);
                        }}
                    >
                        {/* Bulk Actions Toolbar */}
                        <TableSelectionToolbar>
                            <button
                                onClick={() => {
                                    setTransactions((prev) =>
                                        prev.map((tx) =>
                                            selectedItems.includes(tx.id)
                                                ? { ...tx, status: 'posted' }
                                                : tx
                                        )
                                    );
                                    showSuccessToast(`${selectedItems.length} transactions marked as posted`);
                                    setSelectedItems([]);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                            >
                                Mark as Posted
                            </button>
                            <button
                                onClick={() => {
                                    setTransactions((prev) =>
                                        prev.map((tx) =>
                                            selectedItems.includes(tx.id)
                                                ? { ...tx, status: 'excluded' }
                                                : tx
                                        )
                                    );
                                    showSuccessToast(`${selectedItems.length} transactions excluded`);
                                    setSelectedItems([]);
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                            >
                                Exclude
                            </button>
                        </TableSelectionToolbar>

                        <TableHeader>
                            <tr>
                                <TableHead>
                                    <TableSelectAllCheckbox />
                                </TableHead>
                                <TableHead sortable sortKey="date">
                                    Date
                                </TableHead>
                                <TableHead>Bank Description</TableHead>
                                <TableHead sortable sortKey="spent">
                                    Spent
                                </TableHead>
                                <TableHead sortable sortKey="received">
                                    Received
                                </TableHead>
                                <TableHead sortable sortKey="tax">
                                    Tax
                                </TableHead>
                                <TableHead>From/To</TableHead>
                                <TableHead>Match/Categorize</TableHead>
                                <TableHead>Action</TableHead>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {pageData.length === 0 ? (
                                <TableEmptyState
                                    colSpan={9}
                                    message="No transactions found"
                                    description="Try adjusting your filters or add new transactions."
                                />
                            ) : (
                                pageData.map((t) => (
                                    <TableRow key={t.id} rowId={t.id}>
                                        <TableCell>
                                            <TableRowCheckbox rowId={t.id} />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-primary">
                                                {new Date(t.date).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-primary">
                                                    {t.description}
                                                </span>
                                                <span className="text-xs text-primary/50">
                                                    {t.account}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-red-600 font-semibold">
                                                {t.spent ? `-${currency(t.spent)}` : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-green-600 font-semibold">
                                                {t.received ? `+${currency(t.received)}` : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="min-w-[200px]">
                                                    <Combobox
                                                        options={TAX_OPTIONS}
                                                        value={t.taxId || ''}
                                                        onChange={(value) => {
                                                            const rate =
                                                                (value && TAX_RATE_BY_ID[value]) || 0;
                                                            setTransactions((prev) =>
                                                                prev.map((tx) => {
                                                                    if (tx.id !== t.id) return tx;
                                                                    const base = tx.spent ?? 0;
                                                                    const taxAmount = Number(
                                                                        (base * rate).toFixed(2)
                                                                    );
                                                                    return {
                                                                        ...tx,
                                                                        taxId: value || undefined,
                                                                        taxRate: rate || undefined,
                                                                        tax: taxAmount,
                                                                    };
                                                                })
                                                            );
                                                        }}
                                                        placeholder="Select tax..."
                                                        searchPlaceholder="Search tax..."
                                                        className="h-8"
                                                    />
                                                </div>
                                                <span className="text-primary/50 text-xs">
                                                    {currency(t.tax ?? 0)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="min-w-[200px]">
                                                <Combobox
                                                    options={SUPPLIER_OPTIONS}
                                                    value={t.fromTo || ''}
                                                    onChange={(value) => {
                                                        setTransactions((prev) =>
                                                            prev.map((tx) =>
                                                                tx.id === t.id
                                                                    ? {
                                                                          ...tx,
                                                                          fromTo: value || undefined,
                                                                      }
                                                                    : tx
                                                            )
                                                        );
                                                    }}
                                                    placeholder="Select supplier..."
                                                    searchPlaceholder="Search supplier..."
                                                    className="h-8"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-2">
                                                    {t.category || 'Select category'}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setTransactions((prev) =>
                                                            prev.map((tx) =>
                                                                tx.id === t.id
                                                                    ? { ...tx, matched: !tx.matched }
                                                                    : tx
                                                            )
                                                        );
                                                        showSuccessToast(
                                                            t.matched ? 'Unmatched' : 'Matched'
                                                        );
                                                    }}
                                                >
                                                    {t.matched ? 'Matched' : 'Match'}
                                                </Button>
                                                <div className="min-w-[220px]">
                                                    <Combobox
                                                        options={CATEGORY_OPTIONS}
                                                        value={t.category || ''}
                                                        onChange={(value) => {
                                                            setTransactions((prev) =>
                                                                prev.map((tx) =>
                                                                    tx.id === t.id
                                                                        ? {
                                                                              ...tx,
                                                                              category:
                                                                                  value || undefined,
                                                                          }
                                                                        : tx
                                                                )
                                                            );
                                                            if (value) {
                                                                showSuccessToast(
                                                                    `Category set to ${value}`
                                                                );
                                                            }
                                                        }}
                                                        placeholder="Select category..."
                                                        searchPlaceholder="Search category..."
                                                        className="h-8"
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setTransactions((prev) =>
                                                            prev.map((tx) =>
                                                                tx.id === t.id
                                                                    ? {
                                                                          ...tx,
                                                                          status: 'posted',
                                                                      }
                                                                    : tx
                                                            )
                                                        );
                                                        showSuccessToast('Transaction posted');
                                                    }}
                                                >
                                                    Post
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            ⋯
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                showSuccessToast(
                                                                    'Split editor coming soon'
                                                                )
                                                            }
                                                        >
                                                            Split
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                showSuccessToast(
                                                                    'Rule created (demo placeholder)'
                                                                )
                                                            }
                                                        >
                                                            Create rule
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setTransactions((prev) =>
                                                                    prev.map((tx) =>
                                                                        tx.id === t.id
                                                                            ? {
                                                                                  ...tx,
                                                                                  status: 'excluded',
                                                                              }
                                                                            : tx
                                                                    )
                                                                );
                                                                showSuccessToast(
                                                                    'Transaction excluded'
                                                                );
                                                            }}
                                                        >
                                                            Exclude
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <TablePagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={filtered.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default Transactionpage;
