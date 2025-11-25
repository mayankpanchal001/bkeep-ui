import { useState } from 'react';
import {
    FaChevronDown,
    FaChevronRight,
    FaEdit,
    FaFilter,
    FaSearch,
    FaTrash,
} from 'react-icons/fa';
import Button from '../../components/typography/Button';
import { InputField } from '../../components/typography/InputFields';

type Account = {
    id: string;
    name: string;
    type: string;
    category: string;
    balance: number;
    subAccounts?: Account[];
    isExpanded?: boolean;
};

const ACCOUNT_TYPES = [
    'Assets',
    'Liabilities',
    'Equity',
    'Income',
    'Expenses',
] as const;

const MOCK_ACCOUNTS: Account[] = [
    {
        id: '1',
        name: 'Assets',
        type: 'Assets',
        category: 'Parent',
        balance: 125000,
        subAccounts: [
            {
                id: '1-1',
                name: 'Current Assets',
                type: 'Assets',
                category: 'Current Assets',
                balance: 75000,
                subAccounts: [
                    {
                        id: '1-1-1',
                        name: 'Checking Account',
                        type: 'Assets',
                        category: 'Bank',
                        balance: 45000,
                    },
                    {
                        id: '1-1-2',
                        name: 'Savings Account',
                        type: 'Assets',
                        category: 'Bank',
                        balance: 30000,
                    },
                ],
            },
            {
                id: '1-2',
                name: 'Fixed Assets',
                type: 'Assets',
                category: 'Fixed Assets',
                balance: 50000,
                subAccounts: [
                    {
                        id: '1-2-1',
                        name: 'Equipment',
                        type: 'Assets',
                        category: 'Fixed Assets',
                        balance: 35000,
                    },
                    {
                        id: '1-2-2',
                        name: 'Vehicles',
                        type: 'Assets',
                        category: 'Fixed Assets',
                        balance: 15000,
                    },
                ],
            },
        ],
    },
    {
        id: '2',
        name: 'Liabilities',
        type: 'Liabilities',
        category: 'Parent',
        balance: 45000,
        subAccounts: [
            {
                id: '2-1',
                name: 'Current Liabilities',
                type: 'Liabilities',
                category: 'Current Liabilities',
                balance: 30000,
                subAccounts: [
                    {
                        id: '2-1-1',
                        name: 'Accounts Payable',
                        type: 'Liabilities',
                        category: 'Accounts Payable',
                        balance: 20000,
                    },
                    {
                        id: '2-1-2',
                        name: 'Credit Cards',
                        type: 'Liabilities',
                        category: 'Credit Cards',
                        balance: 10000,
                    },
                ],
            },
        ],
    },
    {
        id: '3',
        name: 'Equity',
        type: 'Equity',
        category: 'Equity',
        balance: 80000,
    },
    {
        id: '4',
        name: 'Income',
        type: 'Income',
        category: 'Income',
        balance: 150000,
        subAccounts: [
            {
                id: '4-1',
                name: 'Service Revenue',
                type: 'Income',
                category: 'Service',
                balance: 120000,
            },
            {
                id: '4-2',
                name: 'Product Sales',
                type: 'Income',
                category: 'Sales',
                balance: 30000,
            },
        ],
    },
    {
        id: '5',
        name: 'Expenses',
        type: 'Expenses',
        category: 'Parent',
        balance: 95000,
        subAccounts: [
            {
                id: '5-1',
                name: 'Operating Expenses',
                type: 'Expenses',
                category: 'Operating',
                balance: 70000,
                subAccounts: [
                    {
                        id: '5-1-1',
                        name: 'Rent',
                        type: 'Expenses',
                        category: 'Rent',
                        balance: 12000,
                    },
                    {
                        id: '5-1-2',
                        name: 'Utilities',
                        type: 'Expenses',
                        category: 'Utilities',
                        balance: 5000,
                    },
                    {
                        id: '5-1-3',
                        name: 'Salaries',
                        type: 'Expenses',
                        category: 'Payroll',
                        balance: 53000,
                    },
                ],
            },
            {
                id: '5-2',
                name: 'Cost of Goods Sold',
                type: 'Expenses',
                category: 'COGS',
                balance: 25000,
            },
        ],
    },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

const ChartOfAccountspage = () => {
    const [accounts] = useState<Account[]>(MOCK_ACCOUNTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('All');
    const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
        new Set()
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const toggleAccount = (accountId: string) => {
        const newExpanded = new Set(expandedAccounts);
        if (newExpanded.has(accountId)) {
            newExpanded.delete(accountId);
        } else {
            newExpanded.add(accountId);
        }
        setExpandedAccounts(newExpanded);
    };

    const filteredAccounts = accounts.filter((account) => {
        const matchesSearch =
            account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
            selectedType === 'All' || account.type === selectedType;
        return matchesSearch && matchesType;
    });

    const renderAccount = (account: Account, level: number = 0) => {
        const hasChildren =
            account.subAccounts && account.subAccounts.length > 0;
        const isExpanded = expandedAccounts.has(account.id);
        const indent = level * 24;

        return (
            <div key={account.id}>
                <div
                    className={`flex items-center gap-3 p-3 hover:bg-primary-10 border-b border-primary-10 ${
                        level === 0 ? 'bg-white' : ''
                    }`}
                    style={{ paddingLeft: `${12 + indent}px` }}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {hasChildren ? (
                            <button
                                onClick={() => toggleAccount(account.id)}
                                className="text-primary-50 hover:text-primary transition-colors"
                            >
                                {isExpanded ? (
                                    <FaChevronDown className="w-3 h-3" />
                                ) : (
                                    <FaChevronRight className="w-3 h-3" />
                                )}
                            </button>
                        ) : (
                            <div className="w-5" />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-primary">
                                {account.name}
                            </div>
                            <div className="text-xs text-primary-50">
                                {account.category}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-primary">
                                {currencyFormatter.format(account.balance)}
                            </div>
                            <div className="text-xs text-primary-50">
                                {account.type}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditingAccount(account)}
                                className="p-2 text-primary-50 hover:text-primary hover:bg-primary-10 rounded transition-colors"
                                title="Edit"
                            >
                                <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (
                                        confirm(
                                            `Are you sure you want to delete ${account.name}?`
                                        )
                                    ) {
                                        // Handle delete
                                    }
                                }}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {account.subAccounts?.map((subAccount) =>
                            renderAccount(subAccount, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header Actions */}
            {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={<FaDownload />}>
                        Export
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        variant="primary"
                        icon={<FaPlus />}
                    >
                        New Account
                    </Button>
                </div>
            </div> */}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-10 p-4">
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
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-2 border border-primary-10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
                        >
                            <option value="All">All Types</option>
                            {ACCOUNT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-primary-10 overflow-hidden">
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
                                <th className="px-4 py-3 text-right text-sm font-semibold text-primary">
                                    Balance
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-primary w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAccounts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-primary-50"
                                    >
                                        No accounts found
                                    </td>
                                </tr>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <tr key={account.id}>
                                        <td colSpan={4} className="p-0">
                                            {renderAccount(account)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Account Modal */}
            {(showAddModal || editingAccount) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-xl font-semibold text-primary mb-4">
                            {editingAccount ? 'Edit Account' : 'New Account'}
                        </h3>
                        <form className="space-y-4">
                            <InputField
                                id="account-name"
                                label="Account Name"
                                placeholder="Enter account name"
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">
                                    Account Type
                                </label>
                                <select className="w-full px-4 py-2 border border-primary-10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary">
                                    {ACCOUNT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-primary mb-2">
                                    Category
                                </label>
                                <InputField
                                    id="account-category"
                                    placeholder="Enter category"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingAccount(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                >
                                    {editingAccount ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartOfAccountspage;
