import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Loading from '../components/shared/Loading';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoutes from './PublicRoutes';
import RouteErrorBoundary from './RouteErrorBoundary';

const LAZY_IMPORT_RETRY_KEY = 'bkeep_lazy_import_retry';

function lazyWithRetry<T extends React.ComponentType<Record<string, never>>>(
    importer: () => Promise<{ default: T }>
) {
    return lazy(async () => {
        try {
            const mod = await importer();
            sessionStorage.removeItem(LAZY_IMPORT_RETRY_KEY);
            return mod;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            const isChunkLoadError =
                message.includes(
                    'Failed to fetch dynamically imported module'
                ) ||
                message.includes('Importing a module script failed') ||
                message.includes('Failed to load module script');

            if (isChunkLoadError) {
                const hasRetried = sessionStorage.getItem(
                    LAZY_IMPORT_RETRY_KEY
                );
                if (!hasRetried) {
                    sessionStorage.setItem(LAZY_IMPORT_RETRY_KEY, '1');
                    window.location.reload();
                }
            }

            throw error;
        }
    });
}

// Lazy load pages for code splitting
const Homepage = lazyWithRetry(() => import('../pages/public/Homepage'));
const Loginpage = lazyWithRetry(() => import('../pages/public/Loginpage'));
const PasskeyLoginpage = lazyWithRetry(
    () => import('../pages/public/PasskeyLoginpage')
);
const Registerpage = lazyWithRetry(
    () => import('../pages/public/Registerpage')
);
const ForgotPasswordpage = lazyWithRetry(
    () => import('../pages/public/ForgotPasswordpage')
);
const OtpVerificationpage = lazyWithRetry(
    () => import('../pages/public/OtpVerificationpage')
);
const ResetPasswordpage = lazyWithRetry(
    () => import('../pages/public/ResetPasswordpage')
);
const AcceptInvitationpage = lazyWithRetry(
    () => import('../pages/public/AcceptInvitationpage')
);

const Dashboardpage = lazyWithRetry(
    () => import('../pages/protected/Dashboardpage')
);
const Transactionpage = lazyWithRetry(
    () => import('../pages/protected/Transactionpage')
);
const Reportpage = lazyWithRetry(() => import('../pages/protected/Reportpage'));
const ReportDetailpage = lazyWithRetry(
    () => import('../pages/protected/ReportDetailpage')
);
const IncomeStatementpage = lazyWithRetry(
    () => import('../pages/protected/IncomeStatementpage')
);
const BalanceSheetpage = lazyWithRetry(
    () => import('../pages/protected/BalanceSheetpage')
);
const ChartOfAccountspage = lazyWithRetry(
    () => import('../pages/protected/ChartOfAccountspage')
);
const Settingspage = lazyWithRetry(
    () => import('../pages/protected/Settingspage')
);
const Invoicepage = lazyWithRetry(
    () => import('../pages/protected/Invoicepage')
);
const Expensespage = lazyWithRetry(
    () => import('../pages/protected/Expensespage')
);
const ContactsPage = lazyWithRetry(
    () => import('../pages/protected/ContactsPage')
);
const ContactDetailPage = lazyWithRetry(
    () => import('../pages/protected/ContactDetailPage')
);
const Documentspage = lazyWithRetry(
    () => import('../pages/protected/Documentspage')
);
const ClientReviewpage = lazyWithRetry(
    () => import('../pages/protected/ClientReviewpage')
);
const JournalEntriespage = lazyWithRetry(
    () => import('../pages/protected/JournalEntriespage')
);
const CreateJournalEntrypage = lazyWithRetry(
    () => import('../pages/protected/CreateJournalEntrypage')
);
const ViewJournalEntrypage = lazyWithRetry(
    () => import('../pages/protected/ViewJournalEntrypage')
);
const EditJournalEntrypage = lazyWithRetry(
    () => import('../pages/protected/EditJournalEntrypage')
);

// Lazy load settings components
const ProfileTabWrapper = lazyWithRetry(() =>
    import('../components/settings/SettingsTabWrappers').then((module) => ({
        default: module.ProfileTabWrapper,
    }))
);
const NotificationsTabWrapper = lazyWithRetry(() =>
    import('../components/settings/SettingsTabWrappers').then((module) => ({
        default: module.NotificationsTabWrapper,
    }))
);
const DataPrivacyTab = lazyWithRetry(
    () => import('../components/settings/DataPrivacyTab')
);
const RolesTab = lazyWithRetry(() => import('../components/settings/RolesTab'));
const SecurityTab = lazyWithRetry(
    () => import('../components/settings/SecurityTab')
);
const TenantsTab = lazyWithRetry(
    () => import('../components/settings/TenantsTab')
);
const TaxesTab = lazyWithRetry(() => import('../components/settings/TaxesTab'));
const UsersTab = lazyWithRetry(() => import('../components/settings/UsersTab'));
const TemplatesTab = lazyWithRetry(
    () => import('../components/settings/TemplatesTab')
);

// Helper component to wrap lazy-loaded routes with Suspense
const withSuspense = (
    Component: React.LazyExoticComponent<
        React.ComponentType<Record<string, never>>
    >
) => {
    return (
        <Suspense fallback={<Loading />}>
            <Component />
        </Suspense>
    );
};

const routes = createBrowserRouter([
    {
        element: <PublicRoutes />,
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                path: '/',
                element: withSuspense(Homepage),
            },
            {
                path: '/login',
                element: withSuspense(Loginpage),
            },
            {
                path: '/passkey-login',
                element: withSuspense(PasskeyLoginpage),
            },
            {
                path: '/register',
                element: withSuspense(Registerpage),
            },
            {
                path: '/forgot-password',
                element: withSuspense(ForgotPasswordpage),
            },
            {
                path: '/enter-otp',
                element: withSuspense(OtpVerificationpage),
            },
            {
                path: '/reset-password',
                element: withSuspense(ResetPasswordpage),
            },
            {
                path: '/accept-invitation',
                element: withSuspense(AcceptInvitationpage),
            },
        ],
    },
    {
        element: <ProtectedRoutes />,
        errorElement: <RouteErrorBoundary />,
        children: [
            {
                path: '/dashboard',
                element: withSuspense(Dashboardpage),
            },
            {
                path: '/transactions',
                element: withSuspense(Transactionpage),
            },
            {
                path: '/reports',
                element: withSuspense(Reportpage),
            },
            {
                path: '/reports/:category/:report',
                element: withSuspense(ReportDetailpage),
            },
            {
                path: '/reports/income-statement',
                element: withSuspense(IncomeStatementpage),
            },
            {
                path: '/reports/balance-sheet',
                element: withSuspense(BalanceSheetpage),
            },
            {
                path: '/chart-of-accounts',
                element: withSuspense(ChartOfAccountspage),
            },
            {
                path: '/settings',
                element: withSuspense(Settingspage),
                children: [
                    {
                        index: true,
                        element: <Navigate to="/settings/profile" replace />,
                    },
                    {
                        path: '/settings/profile',
                        element: withSuspense(ProfileTabWrapper),
                    },
                    {
                        path: '/settings/tenants',
                        element: withSuspense(TenantsTab),
                    },
                    {
                        path: '/settings/users',
                        element: withSuspense(UsersTab),
                    },
                    {
                        path: '/settings/roles',
                        element: withSuspense(RolesTab),
                    },
                    {
                        path: '/settings/security',
                        element: withSuspense(SecurityTab),
                    },
                    {
                        path: '/settings/taxes',
                        element: withSuspense(TaxesTab),
                    },
                    {
                        path: '/settings/templates',
                        element: withSuspense(TemplatesTab),
                    },
                    {
                        path: '/settings/data',
                        element: withSuspense(DataPrivacyTab),
                    },
                    {
                        path: '/settings/notifications',
                        element: withSuspense(NotificationsTabWrapper),
                    },
                ],
            },
            {
                path: '/invoices',
                element: withSuspense(Invoicepage),
            },
            {
                path: '/expenses',
                children: [
                    {
                        index: true,
                        element: withSuspense(Expensespage),
                    },
                    {
                        path: 'contacts',
                        element: withSuspense(ContactsPage),
                    },
                    {
                        path: 'contacts/:id',
                        element: withSuspense(ContactDetailPage),
                    },
                ],
            },
            {
                path: '/documents',
                element: withSuspense(Documentspage),
            },
            {
                path: '/client-review',
                element: withSuspense(ClientReviewpage),
            },
            {
                path: '/journal-entries',
                element: withSuspense(JournalEntriespage),
            },
            {
                path: '/journal-entries/new',
                element: withSuspense(CreateJournalEntrypage),
            },
            {
                path: '/journal-entries/:id',
                element: withSuspense(ViewJournalEntrypage),
            },
            {
                path: '/journal-entries/:id/edit',
                element: withSuspense(EditJournalEntrypage),
            },
        ],
    },
]);

export default routes;
