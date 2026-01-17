import {
    PLURAL_TENANT_PREFIX,
    SINGLE_TENANT_PREFIX,
} from '@/components/homepage/constants';
import { Icons } from '@/components/shared/Icons';
import { SidebarItemProps } from '../types';

const CAP_SINGULAR =
    SINGLE_TENANT_PREFIX.charAt(0).toUpperCase() +
    SINGLE_TENANT_PREFIX.slice(1);
const CAP_PLURAL =
    PLURAL_TENANT_PREFIX.charAt(0).toUpperCase() +
    PLURAL_TENANT_PREFIX.slice(1);

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
        children: [
            {
                label: 'All Journal Entries',
                path: '/:id',
            },
        ],
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
        children: [
            {
                label: 'All Expenses',
                path: '/expenses',
            },
            {
                label: 'Contacts',
                path: '/expenses/contacts',
            },
        ],
    },
    {
        label: 'Documents',
        icon: <Icons.Documents />,
        path: '/documents',
    },
    {
        label: `${CAP_SINGULAR} Review`,
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
                label: CAP_PLURAL,
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
                label: 'Taxes',
                icon: <Icons.Expenses />,
                path: '/settings/taxes',
            },
            {
                label: 'Templates',
                icon: <Icons.ChartOfAccounts />,
                path: '/settings/templates',
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
            {
                label: 'Preferences',
                icon: <Icons.Settings />,
                path: '/settings/preferences',
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
