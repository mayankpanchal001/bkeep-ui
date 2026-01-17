// Constants for homepage sections inspired by the Aset layout

import {
    AccountDetailType,
    AccountType,
} from '../../services/apis/chartsAccountApi';

export const SINGLE_TENANT_PREFIX = 'company';
export const PLURAL_TENANT_PREFIX = 'companies';
const CAP_SINGULAR =
    SINGLE_TENANT_PREFIX.charAt(0).toUpperCase() +
    SINGLE_TENANT_PREFIX.slice(1);
const CAP_PLURAL =
    PLURAL_TENANT_PREFIX.charAt(0).toUpperCase() +
    PLURAL_TENANT_PREFIX.slice(1);

export const PAGE_HEADERS = [
    {
        path: '/dashboard',
        title: 'Dashboard',
        subtitle: 'Welcome to your dashboard',
    },
    {
        path: '/transactions',
        title: 'Transactions',
        subtitle: 'View and manage all your financial transactions',
    },
    {
        path: '/reports',
        title: 'Reports',
        subtitle:
            'Deep dive into production, collections, and receivables with intelligent filters.',
    },
    {
        path: '/reports/income-statement',
        title: 'Income Statement',
        subtitle: 'View your revenue, expenses, and net income',
    },
    {
        path: '/reports/balance-sheet',
        title: 'Balance Sheet',
        subtitle: 'View your assets, liabilities, and equity',
    },
    {
        path: '/chart-of-accounts',
        title: 'Chart of Accounts',
        subtitle: 'Manage your accounts and track balances',
    },
    {
        path: '/settings',
        title: 'Settings',
        subtitle: 'Manage your account settings and preferences',
    },
    {
        path: '/settings/profile',
        title: 'Profile Settings',
        subtitle: 'Manage your personal information and account details',
    },
    {
        path: '/settings/tenants',
        title: `${CAP_PLURAL} Management`,
        subtitle: `Manage your organization ${PLURAL_TENANT_PREFIX} and workspaces`,
    },
    {
        path: '/settings/users',
        title: 'Users Management',
        subtitle: 'Manage users, roles, and permissions for your organization',
    },
    {
        path: '/settings/roles',
        title: 'Roles Management',
        subtitle: 'Configure and manage user roles and permissions',
    },
    {
        path: '/settings/security',
        title: 'Security Settings',
        subtitle: 'Manage your account security, passwords, and authentication',
    },
    {
        path: '/settings/data',
        title: 'Data & Privacy',
        subtitle: 'Manage your data privacy settings and preferences',
    },
    {
        path: '/settings/notifications',
        title: 'Notification Settings',
        subtitle: 'Configure your notification preferences and alerts',
    },
    {
        path: '/invoices',
        title: 'Invoices',
        subtitle: 'Create and manage your invoices',
    },
    {
        path: '/expenses',
        title: 'Expenses',
        subtitle: 'Track and manage your business expenses',
    },
    {
        path: '/documents',
        title: 'Documents',
        subtitle: 'Upload and manage your documents',
    },
    {
        path: '/client-review',
        title: `${CAP_SINGULAR} Review`,
        subtitle: 'Review and categorize transactions that need your input',
    },
];

export const TRUSTED_LOGOS = [
    'Wealthro',
    'Finyon',
    'Aegra',
    'Portivio',
    'Vaultic',
    'Altoris',
    'Quantora',
    'Fundara',
];

export const HERO_METRICS = [
    { value: '90%+', label: 'Transactions auto‑categorized' },
    { value: '50% faster', label: 'Month‑end close' },
    { value: '10+', label: `${CAP_PLURAL} per firm on average` },
];

export const PERFORMANCE_STATS = [
    { value: '95%+', label: 'Bank feed match accuracy' },
    { value: '3x', label: 'Faster reconciliations' },
    { value: '100%', label: 'Audit trail coverage' },
];

export const INVEST_FEATURES = [
    {
        title: 'Automated transaction categorization',
        description:
            'AI classifies bank and card activity to your chart of accounts with high accuracy.',
        tag: 'Bookkeeping AI',
    },
    {
        title: 'Smart journal entries',
        description:
            'Create multi-line entries with validations, attachments, and approval workflows.',
        tag: 'Journals',
    },
    {
        title: 'Real-time financial statements',
        description:
            'Income statements and balance sheets update as you post entries and reconciliations.',
        tag: 'Reporting',
    },
    {
        title: `Multi-${SINGLE_TENANT_PREFIX} workspaces`,
        description: `Manage ${PLURAL_TENANT_PREFIX} and entities with strict data isolation, roles, and permissions.`,
        tag: `${CAP_PLURAL} & Roles`,
    },
];

export const CAPABILITY_FEATURES = [
    {
        title: 'Audit‑ready books',
        description:
            'Immutable logs, attachments, and approvals ensure every change is traceable.',
        metric: 'Audit trail',
    },
    {
        title: 'Role‑based access & MFA',
        description: `Granular permissions per ${SINGLE_TENANT_PREFIX} with passkeys and OTP for secure sign‑in.`,
        metric: 'Security',
    },
    {
        title: `${CAP_SINGULAR} collaboration`,
        description:
            'Share requests, upload documents, and review transactions in one place.',
        metric: 'Portal',
    },
];

export const OUTCOME_CARDS = [
    {
        title: 'Accurate books faster',
        description:
            'Reduce manual work with AI categorization and guided reconciliations.',
    },
    {
        title: 'Centralized chart of accounts',
        description: `Standardize across ${PLURAL_TENANT_PREFIX} with reusable account structures and mapping.`,
    },
    {
        title: 'Live cash‑flow insights',
        description:
            'Track cash positions and payables/receivables in real time.',
    },
    {
        title: 'Secure collaboration',
        description: `Role‑based access, MFA, and audit trails across every ${SINGLE_TENANT_PREFIX}.`,
    },
];

export const PRICING_PLANS = [
    {
        name: 'Starter',
        price: '$99',
        cadence: 'Billed monthly',
        description:
            'Perfect for small teams automating bookkeeping and reporting.',
        features: [
            'AI categorization',
            'Bank feeds & reconciliations',
            'Basic reporting',
            'Email support',
        ],
    },
    {
        name: 'Firm',
        price: '$2,099',
        cadence: 'Billed monthly',
        description: `Best for firms managing multiple ${PLURAL_TENANT_PREFIX} and complex workflows.`,
        highlight: 'Best value',
        features: [
            'Advanced AI workflows',
            `Multi‑${SINGLE_TENANT_PREFIX} & roles`,
            'Custom reports & exports',
            'Priority onboarding & support',
        ],
    },
];

export const TESTIMONIALS = [
    {
        quote: 'BKeep AI automated our entire month-end close process. It feels like having an extra team of accountants working 24/7.',
        name: 'Olivia Bennett',
        role: 'Controller',
    },
    {
        quote: 'I categorize thousands of transactions in minutes now. The live analytics and automation save me hours every single week.',
        name: 'Ethan Carter',
        role: 'Senior Accountant',
    },
    {
        quote: 'As a founder, I finally have a financial dashboard that is just as intuitive as it is intelligent. Cash flow is clear.',
        name: 'Jenna Wallace',
        role: 'Startup Founder',
    },
    {
        quote: 'The AI insights helped us catch categorization errors across multiple entities without needing manual review.',
        name: 'Marcus Reed',
        role: 'CFO',
    },
];

export const FAQ_ITEMS = [
    {
        question: 'How is BKeep different from legacy accounting tools?',
        answer: `BKeep combines AI categorization, guided reconciliations, and real-time reporting with multi-${SINGLE_TENANT_PREFIX} controls. No more manual exports or disconnected spreadsheets.`,
    },
    {
        question: 'Is BKeep suitable for small teams or solo accountants?',
        answer: 'Yes. The experience is approachable for small teams while offering enterprise-grade security and audit features.',
    },
    {
        question: 'Can I customize chart of accounts and workflows?',
        answer: `Every ${SINGLE_TENANT_PREFIX} supports bespoke COA mapping, approval policies, and document workflows so your process mirrors how your firm operates.`,
    },
    {
        question: 'How secure is my data?',
        answer: `Data is encrypted in transit and at rest. Each ${SINGLE_TENANT_PREFIX} includes audit trails, MFA/passkeys, and granular role-based access controls.`,
    },
];
// Account Hierarchy Structure
type AccountHierarchyItem = {
    label: string;
    value: string;
    detailTypes: { value: AccountDetailType; label: string }[];
};
export const ACCOUNT_HIERARCHY: Record<AccountType, AccountHierarchyItem[]> = {
    asset: [
        {
            label: 'Accounts Receivable (A/R)',
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
                { value: 'development-costs', label: 'Development Costs' },
                {
                    value: 'employee-cash-advances',
                    label: 'Employee Cash Advances',
                },
                { value: 'inventory', label: 'Inventory' },
                { value: 'investments-other', label: 'Investments - Other' },
                { value: 'loans-to-officers', label: 'Loans to Officers' },
                { value: 'loans-to-others', label: 'Loans to Others' },
                {
                    value: 'loans-to-shareholders',
                    label: 'Loans to Shareholders',
                },
                {
                    value: 'other-current-assets',
                    label: 'Other current assets',
                },
                { value: 'prepaid-expenses', label: 'Prepaid Expenses' },
                { value: 'retainage', label: 'Retainage' },
                { value: 'undeposited-funds', label: 'Undeposited Funds' },
            ],
        },
        {
            label: 'Bank',
            value: 'bank',
            detailTypes: [
                { value: 'cash-on-hand', label: 'Cash on hand' },
                { value: 'chequing', label: 'Chequing' },
                { value: 'money-market', label: 'Money Market' },
                { value: 'rents-held-in-trust', label: 'Rents Held in Trust' },
                { value: 'savings', label: 'Savings' },
                { value: 'trust-account', label: 'Trust account' },
            ],
        },
        {
            label: 'Property, plant and equipment',
            value: 'property-plant-and-equipment',
            detailTypes: [
                {
                    value: 'accumulated-amortization',
                    label: 'Accumulated Amortization',
                },
                {
                    value: 'accumulated-depreciation',
                    label: 'Accumulated Depreciation',
                },
                {
                    value: 'accumulated-depletion',
                    label: 'Accumulataed depletion',
                },
                { value: 'buildings', label: 'Buildings' },
                { value: 'depletable-assets', label: 'Depletable Assets' },
                {
                    value: 'furniture-and-fixtures',
                    label: 'Furniture and Fixtures',
                },
                {
                    value: 'leasehold-improvements',
                    label: 'Leasehold Improvements',
                },
                {
                    value: 'machinery-and-equipment',
                    label: 'Machinery and equipment',
                },
                { value: 'other-fixed-assets', label: 'Other fixed assets' },
                { value: 'vehicles', label: 'Vehicles' },
                {
                    value: 'accumulated-amortization-of-other-assets',
                    label: 'Accumulated Amortization of other Assets',
                },
                {
                    value: 'available-for-sale-financial-assets',
                    label: 'Available-for-sale financial assets',
                },
                { value: 'deferred-tax', label: 'Deferred tax' },
                { value: 'goodwill', label: 'Goodwill' },
                { value: 'intangible-assets', label: 'Intangible Assets' },
                { value: 'investments', label: 'Investments' },
                { value: 'lease-buyout', label: 'Lease Buyout' },
                { value: 'licences', label: 'Licences' },
                {
                    value: 'organizational-costs',
                    label: 'Organizational Costs',
                },
                {
                    value: 'other-long-term-assets',
                    label: 'Other Long-term Assets',
                },
                {
                    value: 'other-intangible-assets',
                    label: 'Other intangible assets',
                },
                {
                    value: 'prepayments-and-accrued-income',
                    label: 'Prepayments and accrued income',
                },
                { value: 'security-deposits', label: 'Security Deposits' },
            ],
        },
    ],
    liability: [
        {
            label: 'Accounts payable (A/P)',
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
            label: 'Other Current Liabilities',
            value: 'other-current-liabilities',
            detailTypes: [
                { value: 'current-liabilities', label: 'Current Liabilities' },
                {
                    value: 'current-tax-liability',
                    label: 'Current Tax Liability',
                },
                {
                    value: 'current-portion-of-employee-benefits-obligations',
                    label: 'Current portion of employee benefits obligations',
                },
                {
                    value: 'current-portion-of-obligations-under-finance-leases',
                    label: 'Current portion of obligations under finance leases',
                },
                { value: 'insurance-payable', label: 'Insurance Payable' },
                { value: 'interest-payable', label: 'Interest payable' },
                { value: 'line-of-credit', label: 'Line of Credit' },
                { value: 'loans-payable', label: 'Loans Payable' },
                { value: 'payroll-clearing', label: 'Payroll Clearing' },
                { value: 'payroll-liabilities', label: 'Payroll liabilities' },
                {
                    value: 'prepaid-expenses-payable',
                    label: 'Prepaid Expenses Payable',
                },
                {
                    value: 'provision-for-warranty-obligations',
                    label: 'Provision for warranty obligations',
                },
                {
                    value: 'rents-in-trust-liability',
                    label: 'Rents in trust - Liability',
                },
                {
                    value: 'short-term-borrowings-from-related-parties',
                    label: 'Short term borrowings from related parties',
                },
                {
                    value: 'trust-accounts-liabilities',
                    label: 'Trust Accounts - Liabilities',
                },
            ],
        },
        {
            label: 'Long-term Liabilities',
            value: 'long-term-liabilities',
            detailTypes: [
                {
                    value: 'accruals-and-deferred-income',
                    label: 'Accruals and Deferred Income',
                },
                { value: 'bank-loans', label: 'Bank loans' },
                {
                    value: 'long-term-borrowings',
                    label: 'Long term borrowings',
                },
                {
                    value: 'long-term-employee-benefit-obligations',
                    label: 'Long term employee benefit obligations',
                },
                { value: 'notes-payable', label: 'Notes Payable' },
                {
                    value: 'obligations-under-finance-leases',
                    label: 'Obligations under finance leases',
                },
                {
                    value: 'other-long-term-liabilities',
                    label: 'Other Long Term Liabilities',
                },
                {
                    value: 'shareholder-notes-payable',
                    label: 'Shareholder Notes Payable',
                },
            ],
        },
    ],
    equity: [
        {
            label: 'Equity',
            value: 'equity',
            detailTypes: [
                {
                    value: 'accumulated-adjustment',
                    label: 'Accumulated adjustment',
                },
                { value: 'common-stock', label: 'Common Stock' },
                {
                    value: 'opening-balance-equity',
                    label: 'opening Balance Equity',
                },
                { value: 'owners-equity', label: "Owner's Equity" },
                {
                    value: 'paid-in-capital-or-surplus',
                    label: 'Paid-in capital or surplus',
                },
                {
                    value: 'partners-contributions',
                    label: 'Partners Contributions',
                },
                {
                    value: 'partners-distributions',
                    label: 'Partners Distributions',
                },
                { value: 'partners-equity', label: "Partner's Equity" },
                { value: 'preferred-stock', label: 'Preferred Stock' },
                { value: 'retained-earnings', label: 'Retained Earnings' },
                { value: 'share-capital', label: 'Share capital' },
                { value: 'treasury-shares', label: 'Treasury Shares' },
            ],
        },
    ],
    income: [
        {
            label: 'Income',
            value: 'income',
            detailTypes: [
                {
                    value: 'discounts-refunds-given',
                    label: 'Discounts/Refunds Given',
                },
                { value: 'non-profit-income', label: 'Non-profit Income' },
                {
                    value: 'other-primary-income',
                    label: 'Other Primary Income',
                },
                {
                    value: 'sales-of-product-income',
                    label: 'Sales of Product Income',
                },
                {
                    value: 'unapplied-cash-payment-income',
                    label: 'Unapplied Cash Payment Income',
                },
            ],
        },
        {
            label: 'Other Income',
            value: 'other-income',
            detailTypes: [
                { value: 'dividend-income', label: 'Dividend income' },
                {
                    value: 'gain-loss-on-sale-of-fixed-assets',
                    label: 'Gain/loss on sale of fixed assets',
                },
                {
                    value: 'gain-loss-on-sale-of-investments',
                    label: 'Gain/loss on sale of investments',
                },
                { value: 'income', label: 'Income' },
                { value: 'interest-earned', label: 'Interest earned' },
                {
                    value: 'other-investment-income',
                    label: 'Other Investment Income',
                },
                { value: 'tax-exempt-interest', label: 'Tax-Exempt Interest' },
            ],
        },
    ],
    expense: [
        {
            label: 'Cost of Goods Sold',
            value: 'cost-of-goods-sold',
            detailTypes: [
                { value: 'cost-of-goods-sold', label: 'Cost of Goods Sold' },
                { value: 'cost-of-labour-cos', label: 'Cost of Labour - COS' },
                {
                    value: 'equipment-rental-cos',
                    label: 'Equipment rental - COS',
                },
                {
                    value: 'other-costs-of-service-cos',
                    label: 'Other costs of service - COS',
                },
                {
                    value: 'shipping-freight-and-delivery-cos',
                    label: 'Shipping, Freight and Delivery - COS',
                },
                {
                    value: 'supplies-and-materials-cos',
                    label: 'Supplies and materials - COS',
                },
            ],
        },
        {
            label: 'Expenses',
            value: 'expenses',
            detailTypes: [
                {
                    value: 'advertising-promotional',
                    label: 'Advertising/Promotional',
                },
                { value: 'auto', label: 'Auto' },
                { value: 'bad-debts', label: 'Bed debts' },
                { value: 'bank-charges', label: 'Bank charges' },
                {
                    value: 'charitable-contributions',
                    label: 'Charitable Contributions',
                },
                { value: 'distribution-costs', label: 'Distribution costs' },
                {
                    value: 'dues-and-subscriptions',
                    label: 'Dues and Subscriptions',
                },
                { value: 'entertainment', label: 'Entertainment' },
                { value: 'equipment-rental', label: 'Equipment rental' },
                { value: 'insurance', label: 'Insurance' },
                { value: 'interest-paid', label: 'Interest paid' },
                {
                    value: 'legal-and-professional-fees',
                    label: 'Legal and professional fees',
                },
                {
                    value: 'meals-and-entertainment',
                    label: 'Meals and entertainment',
                },
                {
                    value: 'office-general-administrative-expenses',
                    label: 'Office/Genera Administrative Expenses',
                },
                {
                    value: 'other-miscellaneous-service-cost',
                    label: 'Other Miscellaneous Service Cost',
                },
                { value: 'payroll-expenses', label: 'Payroll Expenses' },
                {
                    value: 'rent-or-lease-of-buildings',
                    label: 'Rent or Lease of Buildings',
                },
                {
                    value: 'repair-and-maintenance',
                    label: 'Repair and maintenance',
                },
                {
                    value: 'shipping-freight-and-delivery',
                    label: 'Shipping, Freight, and Delivery',
                },
                { value: 'supplies', label: 'Supplies' },
                { value: 'taxes-paid', label: 'Taxes Paid' },
                { value: 'travel', label: 'Travel' },
                { value: 'travel-meals', label: 'Travel meals' },
                {
                    value: 'unapplied-cash-bill-payment-expense',
                    label: 'Unapplied Cash Bill Payment Expense',
                },
                { value: 'utilities', label: 'Utilities' },
            ],
        },
        {
            label: 'Other Expense',
            value: 'other-expense',
            detailTypes: [
                { value: 'amortization', label: 'Amortization' },
                { value: 'depreciation', label: 'Depreciation' },
                {
                    value: 'exchange-gain-or-loss',
                    label: 'Exchange Gain or Loss',
                },
                {
                    value: 'other-miscellaneous-expense',
                    label: 'Other Miscellaneous Expense',
                },
                {
                    value: 'penalties-and-settlements',
                    label: 'Penalties and settlements',
                },
            ],
        },
    ],
};
