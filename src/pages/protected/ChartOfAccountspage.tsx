import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import ImportFileModal from '@/components/shared/ImportFileModal';
import ImportMappingModal from '@/components/shared/ImportMappingModal';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    TableHead,
    TableHeader,
    TableLoadingState,
    TableRow,
    TableRowCheckbox,
    TableSelectAllCheckbox,
    TableSelectionToolbar,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileUp, Filter, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
    useChartOfAccounts,
    useCreateChartOfAccount,
    useDeleteChartOfAccount,
    useImportChartOfAccounts,
    useImportFields,
    useUpdateChartOfAccount,
    type AccountDetailType,
    type AccountType,
    type ChartOfAccount,
    type CreateChartOfAccountPayload,
} from '../../services/apis/chartsAccountApi';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

// Account Type Display Mapping
const ACCOUNT_TYPE_DISPLAY: Record<AccountType, string> = {
    asset: 'Asset',
    liability: 'Liability',
    equity: 'Equity',
    income: 'Income',
    expense: 'Expense',
};

// Account Hierarchy Structure
type AccountHierarchyItem = {
    label: string;
    value: string;
    detailTypes: { value: AccountDetailType; label: string }[];
};

const ACCOUNT_HIERARCHY: Record<AccountType, AccountHierarchyItem[]> = {
    asset: [
        {
            label: 'Bank',
            value: 'bank',
            detailTypes: [
                { value: 'cash', label: 'Cash on hand' },
                { value: 'checking', label: 'Checking' },
                { value: 'money-market', label: 'Money Market' },
                { value: 'rents-held-in-trust', label: 'Rents held in trust' },
                { value: 'savings', label: 'Savings' },
                { value: 'trust-account', label: 'Trust account' },
            ],
        },
        {
            label: 'Accounts Receivable',
            value: 'accounts-receivable',
            detailTypes: [
                {
                    value: 'accounts-receivable',
                    label: 'Accounts Receivable (A/R)',
                },
            ],
        },
        {
            label: 'Current Assets',
            value: 'current-assets',
            detailTypes: [
                {
                    value: 'allowance-for-bad-debts',
                    label: 'Allowance for bad debts',
                },
                { value: 'development-costs', label: 'Development costs' },
                {
                    value: 'employee-cash-advances',
                    label: 'Employee cash advances',
                },
                { value: 'inventory', label: 'Inventory' },
                { value: 'investment', label: 'Investment' },
                { value: 'loans-to-others', label: 'Loans to others' },
                { value: 'other', label: 'Other Current Assets' },
            ],
        },
        {
            label: 'Fixed Assets', // Property plants & equipment
            value: 'fixed-assets',
            detailTypes: [
                { value: 'fixed-asset', label: 'Fixed Asset' },
                {
                    value: 'accumulated-depletion',
                    label: 'Accumulated depletion',
                },
                {
                    value: 'accumulated-depreciation',
                    label: 'Accumulated depreciation',
                },
                { value: 'buildings', label: 'Buildings' },
                { value: 'land', label: 'Land' },
                { value: 'furniture', label: 'Furniture & Equipment' },
            ],
        },
    ],
    liability: [
        {
            label: 'Accounts Payable',
            value: 'accounts-payable',
            detailTypes: [
                { value: 'accounts-payable', label: 'Accounts Payable (A/P)' },
            ],
        },
        {
            label: 'Credit Card',
            value: 'credit-card',
            detailTypes: [{ value: 'credit-card', label: 'Credit Card' }],
        },
        {
            label: 'Current Liabilities',
            value: 'current-liabilities',
            detailTypes: [
                { value: 'loan', label: 'Loan' },
                { value: 'other', label: 'Other Current Liabilities' },
            ],
        },
        {
            label: 'Long Term Liabilities',
            value: 'long-term-liabilities',
            detailTypes: [
                { value: 'loan', label: 'Long-term Loan' },
                { value: 'other', label: 'Other Long-term Liabilities' },
            ],
        },
    ],
    equity: [
        {
            label: 'Equity',
            value: 'equity',
            detailTypes: [
                { value: 'retained-earnings', label: 'Retained Earnings' },
                { value: 'other', label: 'Owner Equity' },
            ],
        },
    ],
    income: [
        {
            label: 'Income',
            value: 'income',
            detailTypes: [
                { value: 'revenue', label: 'Revenue' },
                { value: 'other', label: 'Other Income' },
            ],
        },
    ],
    expense: [
        {
            label: 'Expense',
            value: 'expense',
            detailTypes: [
                { value: 'expense', label: 'Expense' },
                { value: 'other', label: 'Other Expense' },
            ],
        },
        {
            label: 'Cost of Goods Sold',
            value: 'cost-of-goods-sold',
            detailTypes: [
                { value: 'cost-of-goods-sold', label: 'Cost of Goods Sold' },
            ],
        },
    ],
};

// Derived Options for Dropdown
const ACCOUNT_TYPE_DROPDOWN_OPTIONS = Object.entries(ACCOUNT_HIERARCHY).map(
    ([type, subtypes]) => ({
        label: ACCOUNT_TYPE_DISPLAY[type as AccountType],
        options: subtypes.map((subtype) => ({
            label: subtype.label,
            value: subtype.value,
        })),
    })
);

// Simple Options for Filter (Main Types only)
const ACCOUNT_TYPE_OPTIONS = Object.keys(ACCOUNT_HIERARCHY).map((type) => ({
    value: type as AccountType,
    label: ACCOUNT_TYPE_DISPLAY[type as AccountType],
}));

// Helper to find Main Type and Details by Subtype Value
const getAccountDetailsBySubType = (subTypeValue: string) => {
    for (const [mainType, subtypes] of Object.entries(ACCOUNT_HIERARCHY)) {
        const subtype = subtypes.find((s) => s.value === subTypeValue);
        if (subtype) {
            return {
                mainType: mainType as AccountType,
                detailTypes: subtype.detailTypes,
            };
        }
    }
    return null;
};

// Helper to find Subtype by Detail Type (for initial loading/editing)
const getSubTypeByDetailType = (
    mainType: AccountType,
    detailType: AccountDetailType
) => {
    const subtypes = ACCOUNT_HIERARCHY[mainType];
    if (!subtypes) return '';
    for (const subtype of subtypes) {
        if (subtype.detailTypes.some((d) => d.value === detailType)) {
            return subtype.value;
        }
    }
    // Fallback to first subtype if not found
    return subtypes[0]?.value || '';
};

const ChartOfAccountspage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<AccountType[]>([]);
    const [selectedDetailTypes, setSelectedDetailTypes] = useState<
        AccountDetailType[]
    >([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(
        null
    );
    const [deleteAccount, setDeleteAccount] = useState<ChartOfAccount | null>(
        null
    );
    const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isActiveFilter, setIsActiveFilter] = useState<
        'all' | 'active' | 'inactive'
    >('all');

    // Import State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState<CreateChartOfAccountPayload>({
        accountName: '',
        accountType: 'asset',
        accountDetailType: 'checking',
        openingBalance: 0,
        description: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedAccountSubType, setSelectedAccountSubType] =
        useState<string>('bank');

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedSearchQuery(searchQuery.trim());
        }, 250);
        return () => window.clearTimeout(handle);
    }, [searchQuery]);

    // API hooks
    const serverAccountTypeParam =
        selectedTypes.length === 1 ? selectedTypes[0] : undefined;
    const serverIsActiveParam =
        isActiveFilter === 'all' ? undefined : isActiveFilter === 'active';
    const { data, isLoading, isFetching, error } = useChartOfAccounts({
        search: debouncedSearchQuery || undefined,
        accountType: serverAccountTypeParam,
        isActive: serverIsActiveParam,
    });

    const { data: importFieldsData } = useImportFields();
    const createMutation = useCreateChartOfAccount();
    const updateMutation = useUpdateChartOfAccount();
    const deleteMutation = useDeleteChartOfAccount();
    const importMutation = useImportChartOfAccounts();

    const accounts = useMemo(() => {
        let allAccounts = data?.data?.items || [];
        const q = searchQuery.trim().toLowerCase();

        // Client-side multi filters
        if (selectedTypes.length > 0) {
            allAccounts = allAccounts.filter((a) =>
                selectedTypes.includes(a.accountType)
            );
        }
        if (selectedDetailTypes.length > 0) {
            allAccounts = allAccounts.filter((a) =>
                selectedDetailTypes.includes(a.accountDetailType)
            );
        }
        if (isActiveFilter !== 'all') {
            const wantActive = isActiveFilter === 'active';
            allAccounts = allAccounts.filter((a) => a.isActive === wantActive);
        }

        if (!q) return allAccounts;

        return allAccounts.filter((account) => {
            const haystack = [
                account.accountName,
                account.accountNumber,
                account.description,
                account.accountType,
                account.accountDetailType,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(q);
        });
    }, [data, searchQuery, selectedTypes, selectedDetailTypes, isActiveFilter]);

    const rowIds = accounts.map((a) => a.id);

    // Derived state for detail type options
    const detailTypeOptions = useMemo(() => {
        const details = getAccountDetailsBySubType(selectedAccountSubType);
        return details?.detailTypes || [];
    }, [selectedAccountSubType]);

    // Handle form reset
    const resetForm = () => {
        setFormData({
            accountName: '',
            accountType: 'asset',
            accountDetailType: 'cash',
            openingBalance: 0,
            description: '',
        });
        setSelectedAccountSubType('bank');
        setFormErrors({});
        setEditingAccount(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEditModal = (account: ChartOfAccount) => {
        setEditingAccount(account);
        setFormData({
            accountName: account.accountName,
            accountType: account.accountType,
            accountDetailType: account.accountDetailType,
            openingBalance: Number(account.openingBalance) || 0,
            description: account.description || '',
        });
        const subType = getSubTypeByDetailType(
            account.accountType,
            account.accountDetailType
        );
        setSelectedAccountSubType(subType);
        setFormErrors({});
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingAccount(null);
        resetForm();
    };

    // Validation
    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.accountName.trim()) {
            errors.accountName = 'Account Name is required';
        }
        if (!formData.accountType) {
            errors.accountType = 'Account Type is required';
        }
        if (!formData.accountDetailType) {
            errors.accountDetailType = 'Detail Type is required';
        }
        if (formData.openingBalance < 0) {
            errors.openingBalance = 'Opening Balance cannot be negative';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (editingAccount) {
            updateMutation.mutate(
                { id: editingAccount.id, payload: formData },
                {
                    onSuccess: () => {
                        handleCloseModal();
                    },
                }
            );
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    handleCloseModal();
                },
            });
        }
    };

    const handleDelete = () => {
        if (deleteAccount) {
            deleteMutation.mutate(deleteAccount.id, {
                onSuccess: () => {
                    setDeleteAccount(null);
                },
            });
        }
    };

    // --- Import Handlers ---
    const handleImportClick = () => {
        setShowUploadModal(true);
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
                const headers = jsonData[0] as string[];
                setFileHeaders(headers);

                // Auto-map fields with matching names (case-insensitive)
                const importFields = importFieldsData?.data || [];
                const autoMapping: Record<string, string> = {};

                importFields.forEach((field) => {
                    const match = headers.find(
                        (header) =>
                            header.toLowerCase() ===
                                field.label.toLowerCase() ||
                            header.toLowerCase() === field.key.toLowerCase()
                    );
                    if (match) {
                        autoMapping[field.key] = match;
                    }
                });

                // Check if all required fields are mapped
                const requiredFields = importFields.filter((f) => f.required);
                const allRequiredMapped = requiredFields.every(
                    (f) => autoMapping[f.key]
                );

                setShowUploadModal(false);

                // If all required fields are auto-mapped, directly import
                if (allRequiredMapped && requiredFields.length > 0) {
                    handleImportConfirm(autoMapping);
                } else {
                    // Otherwise, show mapping modal
                    setShowMappingModal(true);
                }
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImportModalClose = () => {
        setShowMappingModal(false);
        setSelectedFile(null);
        setFileHeaders([]);
    };

    const handleImportConfirm = (mapping: Record<string, string>) => {
        if (selectedFile) {
            importMutation.mutate(
                { file: selectedFile, mapping },
                {
                    onSuccess: () => {
                        handleImportModalClose();
                    },
                }
            );
        }
    };

    const handleBulkDelete = () => {
        console.log('Deleting accounts:', selectedItems);
        setSelectedItems([]);
    };

    const handleBulkExport = () => {
        console.log('Exporting accounts:', selectedItems);
        setSelectedItems([]);
    };

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="search-accounts"
                            placeholder="Search accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            startIcon={<Search size={16} />}
                        />
                    </div>
                    <Select
                        value={
                            selectedTypes.length === 1
                                ? selectedTypes[0]
                                : 'all'
                        }
                        onValueChange={(val) => {
                            if (val === 'all') setSelectedTypes([]);
                            else setSelectedTypes([val as AccountType]);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsFilterOpen(true)}
                        variant="outline"
                    >
                        <Filter size={16} className="mr-2" /> Filters
                    </Button>
                    <Button
                        onClick={handleImportClick}
                        variant="outline"
                        disabled={importMutation.isPending}
                    >
                        <FileUp size={16} className="mr-2" /> Import
                    </Button>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <Button onClick={handleOpenAddModal} variant="default">
                        <Plus size={16} className="mr-2" /> New Chart of Account
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border-b border-red-200 rounded">
                    Error loading accounts: {error.message}
                </div>
            )}

            {/* Accounts Table */}
            <Table
                enableSelection
                containerClassName="flex-1 overflow-hidden [&>div]:h-full [&>div]:overflow-auto"
                rowIds={rowIds}
                selectedIds={selectedItems}
                onSelectionChange={setSelectedItems}
            >
                <TableSelectionToolbar>
                    <button
                        onClick={handleBulkExport}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                        Export Selected
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                    >
                        Delete Selected
                    </button>
                </TableSelectionToolbar>

                <TableHeader>
                    <tr>
                        <TableHead>
                            <TableSelectAllCheckbox />
                        </TableHead>
                        <TableHead sortable sortKey="accountName">
                            Account Name
                        </TableHead>
                        <TableHead sortable sortKey="accountType">
                            Type
                        </TableHead>
                        <TableHead>Detail Type</TableHead>
                        <TableHead
                            align="right"
                            sortable
                            sortKey="currentBalance"
                        >
                            Current Balance
                        </TableHead>
                        <TableHead align="center">Actions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {isLoading || isFetching ? (
                        <TableLoadingState colSpan={6} rows={8} />
                    ) : accounts.length === 0 ? (
                        <TableEmptyState
                            colSpan={6}
                            message="No accounts found"
                            description="Create your first account to get started"
                        />
                    ) : (
                        accounts.map((account) => (
                            <TableRow key={account.id} rowId={account.id}>
                                <TableCell>
                                    <TableRowCheckbox rowId={account.id} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <div className="font-medium text-primary">
                                            {account.accountName}
                                        </div>
                                        {account.description && (
                                            <div className="text-xs text-primary/50 mt-1">
                                                {account.description}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-primary">
                                        {
                                            ACCOUNT_TYPE_DISPLAY[
                                                account.accountType
                                            ]
                                        }
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-primary/75 capitalize">
                                        {account.accountDetailType.replace(
                                            /-/g,
                                            ' '
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell align="right">
                                    <span className="font-semibold text-primary">
                                        {currencyFormatter.format(
                                            parseFloat(
                                                account.currentBalance ||
                                                    String(
                                                        account.openingBalance
                                                    )
                                            )
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell align="center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() =>
                                                        handleOpenEditModal(
                                                            account
                                                        )
                                                    }
                                                    className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Edit
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() =>
                                                        setDeleteAccount(
                                                            account
                                                        )
                                                    }
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Delete
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Filters Drawer */}
            <Drawer
                open={isFilterOpen}
                onOpenChange={(open) => setIsFilterOpen(open)}
                direction="right"
            >
                <DrawerContent className="data-[vaul-drawer-direction=right]:w-[420px] data-[vaul-drawer-direction=right]:sm:max-w-[420px] bg-card dark:bg-surface-muted">
                    <DrawerHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-primary/10">
                        <DrawerTitle className="text-xl font-semibold text-primary">
                            Filters
                        </DrawerTitle>
                        <DrawerClose asChild>
                            <button
                                className="p-2 -mr-2 text-primary/50 hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </DrawerClose>
                    </DrawerHeader>
                    <div className="flex flex-col h-full p-4">
                        <div className="space-y-6 flex-1">
                            <div>
                                <div className="text-sm font-semibold text-primary mb-2">
                                    Account Types
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                                        const active = selectedTypes.includes(
                                            opt.value
                                        );
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTypes((prev) =>
                                                        active
                                                            ? prev.filter(
                                                                  (t) =>
                                                                      t !==
                                                                      opt.value
                                                              )
                                                            : [
                                                                  ...prev,
                                                                  opt.value,
                                                              ]
                                                    );
                                                }}
                                                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                                    active
                                                        ? 'bg-primary/10 text-primary border border-primary/10'
                                                        : 'text-primary/60 hover:bg-primary/10'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-primary mb-2">
                                    Detail Types
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
                                    {Object.entries(ACCOUNT_HIERARCHY)
                                        .filter(
                                            ([type]) =>
                                                selectedTypes.length === 0 ||
                                                selectedTypes.includes(
                                                    type as AccountType
                                                )
                                        )
                                        .flatMap(([, subs]) =>
                                            subs.flatMap(
                                                (sub) => sub.detailTypes
                                            )
                                        )
                                        .reduce(
                                            (acc, dt) => {
                                                if (
                                                    !acc.some(
                                                        (x) =>
                                                            x.value === dt.value
                                                    )
                                                ) {
                                                    acc.push(dt);
                                                }
                                                return acc;
                                            },
                                            [] as {
                                                value: AccountDetailType;
                                                label: string;
                                            }[]
                                        )
                                        .map((dt) => {
                                            const active =
                                                selectedDetailTypes.includes(
                                                    dt.value
                                                );
                                            return (
                                                <button
                                                    key={dt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDetailTypes(
                                                            (prev) =>
                                                                active
                                                                    ? prev.filter(
                                                                          (v) =>
                                                                              v !==
                                                                              dt.value
                                                                      )
                                                                    : [
                                                                          ...prev,
                                                                          dt.value,
                                                                      ]
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                                                        active
                                                            ? 'bg-primary/10 text-primary border border-primary/10'
                                                            : 'text-primary/60 hover:bg-primary/10'
                                                    }`}
                                                >
                                                    {dt.label}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-primary mb-2">
                                    Status
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(['active', 'inactive'] as const).map(
                                        (s) => {
                                            const active =
                                                (isActiveFilter === 'active' &&
                                                    s === 'active') ||
                                                (isActiveFilter ===
                                                    'inactive' &&
                                                    s === 'inactive');
                                            return (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => {
                                                        setIsActiveFilter(
                                                            active ? 'all' : s
                                                        );
                                                    }}
                                                    className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                                                        active
                                                            ? 'bg-primary/10 text-primary border border-primary/10'
                                                            : 'text-primary/60 hover:bg-primary/10'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between gap-3 mt-8 pt-4 border-t border-primary/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSelectedTypes([]);
                                    setSelectedDetailTypes([]);
                                    setIsActiveFilter('all');
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => setIsFilterOpen(false)}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Add/Edit Account Drawer */}
            <Drawer
                open={showAddModal || !!editingAccount}
                onOpenChange={(open) => {
                    if (!open) {
                        if (
                            createMutation.isPending ||
                            updateMutation.isPending
                        )
                            return;
                        handleCloseModal();
                    }
                }}
                direction="right"
            >
                <DrawerContent className="data-[vaul-drawer-direction=right]:w-[480px] data-[vaul-drawer-direction=right]:sm:max-w-[480px] bg-card dark:bg-surface-muted">
                    <DrawerHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-primary/10">
                        <DrawerTitle className="text-xl font-semibold text-primary">
                            {editingAccount ? 'Edit Account' : 'New Account'}
                        </DrawerTitle>
                        <DrawerClose asChild>
                            <button
                                className="p-2 -mr-2 text-primary/50 hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                                aria-label="Close"
                                disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </DrawerClose>
                    </DrawerHeader>
                    <div className="flex flex-col h-full p-4">
                        <form
                            id="chart-of-account-form"
                            onSubmit={handleSubmit}
                            className="space-y-4 flex-1"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="account-name">
                                    Account Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="account-name"
                                    placeholder="Enter account name"
                                    value={formData.accountName}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            accountName: e.target.value,
                                        });
                                        if (formErrors.accountName) {
                                            setFormErrors((prev) => ({
                                                ...prev,
                                                accountName: '',
                                            }));
                                        }
                                    }}
                                    required
                                />
                                {formErrors.accountName && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {formErrors.accountName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account-type">
                                    Account Type{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedAccountSubType}
                                    onValueChange={(value) => {
                                        const newSubType = value;
                                        setSelectedAccountSubType(newSubType);

                                        const details =
                                            getAccountDetailsBySubType(
                                                newSubType
                                            );
                                        if (details) {
                                            setFormData({
                                                ...formData,
                                                accountType: details.mainType,
                                                accountDetailType:
                                                    details.detailTypes[0]
                                                        ?.value || 'other',
                                            });
                                        }

                                        if (formErrors.accountType) {
                                            setFormErrors((prev) => ({
                                                ...prev,
                                                accountType: '',
                                            }));
                                        }
                                    }}
                                >
                                    <SelectTrigger id="account-type">
                                        <SelectValue placeholder="Select Account Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACCOUNT_TYPE_DROPDOWN_OPTIONS.map(
                                            (group) => (
                                                <div key={group.label}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                        {group.label}
                                                    </div>
                                                    {group.options.map(
                                                        (opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }
                                                            >
                                                                {opt.label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                {formErrors.accountType && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {formErrors.accountType}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account-detail-type">
                                    Account Detail Type{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.accountDetailType}
                                    onValueChange={(value) => {
                                        setFormData({
                                            ...formData,
                                            accountDetailType:
                                                value as AccountDetailType,
                                        });
                                        if (formErrors.accountDetailType) {
                                            setFormErrors((prev) => ({
                                                ...prev,
                                                accountDetailType: '',
                                            }));
                                        }
                                    }}
                                >
                                    <SelectTrigger id="account-detail-type">
                                        <SelectValue placeholder="Select Detail Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {detailTypeOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.accountDetailType && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {formErrors.accountDetailType}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="opening-balance">
                                    Opening Balance{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="opening-balance"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.openingBalance.toString()}
                                    onChange={(e) => {
                                        const value =
                                            parseFloat(e.target.value) || 0;
                                        setFormData({
                                            ...formData,
                                            openingBalance: value,
                                        });
                                        if (formErrors.openingBalance) {
                                            setFormErrors((prev) => ({
                                                ...prev,
                                                openingBalance: '',
                                            }));
                                        }
                                    }}
                                    required
                                />
                                {formErrors.openingBalance && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {formErrors.openingBalance}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Enter description (optional)"
                                    value={formData.description || ''}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        });
                                    }}
                                />
                            </div>
                        </form>
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-primary/10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseModal}
                                disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                                form="chart-of-account-form"
                            >
                                {editingAccount ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={!!deleteAccount}
                onClose={() => setDeleteAccount(null)}
                onConfirm={handleDelete}
                title="Delete Account"
                message={`Are you sure you want to delete "${deleteAccount?.accountName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
                loading={deleteMutation.isPending}
            />

            {/* Import Mapping Modal */}
            <ImportFileModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onFileSelect={handleFileSelect}
            />
            <ImportMappingModal
                isOpen={showMappingModal}
                onClose={handleImportModalClose}
                onConfirm={handleImportConfirm}
                fileHeaders={fileHeaders}
                importFields={importFieldsData?.data || []}
                filename={selectedFile?.name || ''}
                isUploading={importMutation.isPending}
            />
        </div>
    );
};

export default ChartOfAccountspage;
