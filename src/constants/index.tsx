import { SidebarItemProps } from '../types';
import { Icons } from '/src/components/shared/Icons';

export const SIDEBAR_ITEMS: SidebarItemProps[] = [
    {
        label: 'Dashboard',
        icon: <Icons.Dashboard />,
        path: '/dashboard',
    },
    {
        label: 'Transactions',
        icon: <Icons.Transactions />,
        path: '/transactions',
    },
    {
        label: 'Reports',
        icon: <Icons.Reports />,
        path: '/reports',
        children: [
            {
                label: 'Income Statement',
                path: '/reports/income-statement',
            },
            {
                label: 'Balance Sheet',
                path: '/reports/balance-sheet',
            },
        ],
    },
    {
        label: 'Chart of Accounts',
        icon: <Icons.ChartOfAccounts />,
        path: '/chart-of-accounts',
    },
    {
        label: 'Journal Entries',
        icon: <Icons.JournalEntries />,
        path: '/journal-entries',
    },
    {
        label: 'Invoices',
        icon: <Icons.Invoices />,
        path: '/invoices',
    },
    {
        label: 'Expenses',
        icon: <Icons.Expenses />,
        path: '/expenses',
    },
    {
        label: 'Documents',
        icon: <Icons.Documents />,
        path: '/documents',
    },
    {
        label: 'Client Review',
        icon: <Icons.ClientReview />,
        path: '/client-review',
    },
    {
        label: 'Settings',
        icon: <Icons.Settings />,
        path: '/settings',
        children: [
            {
                label: 'Profile',
                icon: <Icons.Profile />,
                path: '/settings/profile',
            },
            {
                label: 'Tenants',
                icon: <Icons.Building />,
                path: '/settings/tenants',
            },
            {
                label: 'Users',
                icon: <Icons.Users />,
                path: '/settings/users',
            },
            {
                label: 'Roles',
                icon: <Icons.Roles />,
                path: '/settings/roles',
            },
            {
                label: 'Security',
                icon: <Icons.Shield />,
                path: '/settings/security',
            },
            {
                label: 'Data Privacy',
                icon: <Icons.Database />,
                path: '/settings/data',
            },
            {
                label: 'Notifications',
                icon: <Icons.Notifications />,
                path: '/settings/notifications',
            },
        ],
    },
];

export const LOGOUT_ITEM = {
    label: 'Logout',
    icon: <Icons.Logout />,
    path: '/logout',
};

export const APP_TITLE = 'BKeep Accounting';

export const USER_NAME = 'Mauank';
