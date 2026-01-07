// Constants for homepage sections inspired by the Aset layout

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
