import { useMemo, useState } from 'react';
import {
    FaEdit,
    FaFileDownload,
    FaFileImport,
    FaFilter,
    FaPlus,
    FaSearch,
    FaTrash,
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import ImportFileModal from '../../components/shared/ImportFileModal';
import ImportMappingModal from '../../components/shared/ImportMappingModal';
import Loading from '../../components/shared/Loading';
import Offcanvas from '../../components/shared/Offcanvas';
import Button from '../../components/typography/Button';
import {
    InputField,
    SelectField,
} from '../../components/typography/InputFields';
import {
    downloadSampleData,
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
    const [selectedType, setSelectedType] = useState<AccountType | 'all'>(
        'all'
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(
        null
    );
    const [deleteAccount, setDeleteAccount] = useState<ChartOfAccount | null>(
        null
    );

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

    // API hooks
    const { data, isLoading, error } = useChartOfAccounts({
        search: searchQuery || undefined,
        accountType: selectedType !== 'all' ? selectedType : undefined,
    });

    const { data: importFieldsData } = useImportFields();
    const createMutation = useCreateChartOfAccount();
    const updateMutation = useUpdateChartOfAccount();
    const deleteMutation = useDeleteChartOfAccount();
    const importMutation = useImportChartOfAccounts();

    const accounts = useMemo(() => {
        return data?.data?.items || [];
    }, [data]);

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

    // Handle open add modal
    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    // Handle open edit modal
    const handleOpenEditModal = (account: ChartOfAccount) => {
        const subType = getSubTypeByDetailType(
            account.accountType,
            account.accountDetailType
        );
        setSelectedAccountSubType(subType);
        setFormData({
            accountName: account.accountName,
            accountType: account.accountType,
            accountDetailType: account.accountDetailType,
            openingBalance: parseFloat(account.openingBalance),
            description: account.description || '',
        });
        setFormErrors({});
        setEditingAccount(account);
    };

    // Handle close modal
    const handleCloseModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleDownloadSample = async () => {
        try {
            const blob = await downloadSampleData();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chart-of-accounts-sample.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download sample data', error);
        }
    };

    const handleImportClick = () => {
        setShowUploadModal(true);
    };

    const handleFileSelect = (file: File) => {
        if (file) {
            setSelectedFile(file);
            setShowUploadModal(false);

            // Read file headers
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                    });

                    if (jsonData.length > 0) {
                        const headers = jsonData[0] as string[];
                        setFileHeaders(headers);
                        setShowMappingModal(true);
                    }
                } catch (error) {
                    console.error('Error reading file headers:', error);
                    // Reset selected file
                    setSelectedFile(null);
                }
            };
            reader.readAsBinaryString(file);
        }
    };

    const handleImportConfirm = async (mapping: Record<string, string>) => {
        if (!selectedFile) return;

        try {
            await importMutation.mutateAsync({
                file: selectedFile,
                mapping,
            });
            setShowMappingModal(false);
            setSelectedFile(null);
            setFileHeaders([]);
        } catch (error) {
            console.error('Import error:', error);
            // Error handled in hook
        }
    };

    const handleImportModalClose = () => {
        setShowMappingModal(false);
        setSelectedFile(null);
        setFileHeaders([]);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const errors: Record<string, string> = {};
        if (!formData.accountName.trim()) {
            errors.accountName = 'Account name is required';
        }
        if (!formData.accountType) {
            errors.accountType = 'Account type is required';
        }
        if (!formData.accountDetailType) {
            errors.accountDetailType = 'Detail type is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            if (editingAccount) {
                // Update existing account
                if (!editingAccount.id) {
                    throw new Error('Account ID is required for update');
                }
                await updateMutation.mutateAsync({
                    id: editingAccount.id,
                    payload: {
                        accountName: formData.accountName,
                        accountType: formData.accountType,
                        accountDetailType: formData.accountDetailType,
                        openingBalance: formData.openingBalance,
                        description: formData.description,
                    },
                });
            } else {
                // Create new account
                await createMutation.mutateAsync(formData);
            }
            handleCloseModal();
        } catch (error) {
            // Error is handled by the mutation
            console.error('Form submission error:', error);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deleteAccount) return;

        try {
            await deleteMutation.mutateAsync(deleteAccount.id);
            setDeleteAccount(null);
        } catch (error) {
            // Error is handled by the mutation
            console.error('Delete error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-500 mb-4">
                        Failed to load chart of accounts
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleOpenAddModal}
                        variant="primary"
                        icon={<FaPlus />}
                    >
                        New Account
                    </Button>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <Button
                        onClick={handleDownloadSample}
                        variant="outline"
                        icon={<FaFileDownload />}
                        title="Download Sample Excel Template"
                    >
                        Sample Data
                    </Button>
                    <Button
                        onClick={handleImportClick}
                        variant="outline"
                        icon={<FaFileImport />}
                        loading={importMutation.isPending}
                        disabled={importMutation.isPending}
                    >
                        Import
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2 shadow-sm border border-primary-10 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <InputField
                                id="search-accounts"
                                placeholder="Search accounts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                icon={<FaSearch />}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-primary-50" />
                        <SelectField
                            id="filter-account-type"
                            value={selectedType}
                            onChange={(e) =>
                                setSelectedType(
                                    e.target.value as AccountType | 'all'
                                )
                            }
                            options={[
                                { value: 'all', label: 'All Types' },
                                ...ACCOUNT_TYPE_OPTIONS,
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-2 shadow-sm border border-primary-10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-primary-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                                    Account Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-primary">
                                    Detail Type
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
                                    Current Balance
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-primary w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-primary-50"
                                    >
                                        No accounts found
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((account) => (
                                    <tr
                                        key={account.id || account.accountName}
                                        className="border-b border-primary-10 hover:bg-primary-10 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-primary">
                                                {account.accountName}
                                            </div>
                                            <div className="text-xs text-primary-50 mt-1">
                                                {account.accountNumber}
                                            </div>
                                            {account.description && (
                                                <div className="text-xs text-primary-50 mt-1">
                                                    {account.description}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="text-sm text-primary">
                                                {
                                                    ACCOUNT_TYPE_DISPLAY[
                                                        account.accountType
                                                    ]
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="text-sm text-primary-75 capitalize">
                                                {account.accountDetailType.replace(
                                                    /-/g,
                                                    ' '
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="font-semibold text-primary">
                                                {currencyFormatter.format(
                                                    parseFloat(
                                                        account.currentBalance ||
                                                            account.openingBalance
                                                    )
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleOpenEditModal(
                                                            account
                                                        )
                                                    }
                                                    className="p-2 text-primary-50 hover:text-primary hover:bg-primary-10 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeleteAccount(
                                                            account
                                                        )
                                                    }
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Account Modal */}
            <Offcanvas
                isOpen={showAddModal || !!editingAccount}
                onClose={handleCloseModal}
                title={editingAccount ? 'Edit Account' : 'New Account'}
                position="right"
                width="w-[480px]"
                closeOnBackdropClick={
                    !(createMutation.isPending || updateMutation.isPending)
                }
                closeOnEscape={
                    !(createMutation.isPending || updateMutation.isPending)
                }
            >
                <div className="flex flex-col h-full">
                    <form
                        id="chart-of-account-form"
                        onSubmit={handleSubmit}
                        className="space-y-4 flex-1"
                    >
                        <div>
                            <InputField
                                id="account-name"
                                label="Account Name"
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

                        <div>
                            <SelectField
                                id="account-type"
                                label="Account Type"
                                value={selectedAccountSubType}
                                onChange={(e) => {
                                    const newSubType = e.target.value;
                                    setSelectedAccountSubType(newSubType);

                                    const details =
                                        getAccountDetailsBySubType(newSubType);
                                    if (details) {
                                        setFormData({
                                            ...formData,
                                            accountType: details.mainType,
                                            accountDetailType:
                                                details.detailTypes[0]?.value ||
                                                'other',
                                        });
                                    }

                                    if (formErrors.accountType) {
                                        setFormErrors((prev) => ({
                                            ...prev,
                                            accountType: '',
                                        }));
                                    }
                                }}
                                required
                                options={ACCOUNT_TYPE_DROPDOWN_OPTIONS}
                            />
                            {formErrors.accountType && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formErrors.accountType}
                                </p>
                            )}
                        </div>

                        <div>
                            <SelectField
                                id="account-detail-type"
                                label="Account Detail Type"
                                value={formData.accountDetailType}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        accountDetailType: e.target
                                            .value as AccountDetailType,
                                    });
                                    if (formErrors.accountDetailType) {
                                        setFormErrors((prev) => ({
                                            ...prev,
                                            accountDetailType: '',
                                        }));
                                    }
                                }}
                                required
                                options={detailTypeOptions}
                            />
                            {formErrors.accountDetailType && (
                                <p className="text-red-500 text-xs mt-1">
                                    {formErrors.accountDetailType}
                                </p>
                            )}
                        </div>

                        <div>
                            <InputField
                                id="opening-balance"
                                label="Opening Balance"
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

                        <div>
                            <InputField
                                id="description"
                                label="Description"
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

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-primary-10">
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
                            variant="primary"
                            loading={
                                createMutation.isPending ||
                                updateMutation.isPending
                            }
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
            </Offcanvas>

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
