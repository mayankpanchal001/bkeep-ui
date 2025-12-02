import { createBrowserRouter } from 'react-router';
import BalanceSheetpage from '../pages/protected/BalanceSheetpage';
import ChartOfAccountspage from '../pages/protected/ChartOfAccountspage';
import ClientReviewpage from '../pages/protected/ClientReviewpage';
import Dashboardpage from '../pages/protected/Dashboardpage';
import Documentspage from '../pages/protected/Documentspage';
import Expensespage from '../pages/protected/Expensespage';
import IncomeStatementpage from '../pages/protected/IncomeStatementpage';
import Invoicepage from '../pages/protected/Invoicepage';
import Reportpage from '../pages/protected/Reportpage';
import Settingspage from '../pages/protected/Settingspage';
import Transactionpage from '../pages/protected/Transactionpage';
import ForgotPasswordpage from '../pages/public/ForgotPasswordpage';
import Homepage from '../pages/public/Homepage';
import Loginpage from '../pages/public/Loginpage';
import OtpVerificationpage from '../pages/public/OtpVerificationpage';
import PasskeyLoginpage from '../pages/public/PasskeyLoginpage';
import Registerpage from '../pages/public/Registerpage';
import ResetPasswordpage from '../pages/public/ResetPasswordpage';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoutes from './PublicRoutes';

const routes = createBrowserRouter([
    {
        element: <PublicRoutes />,
        children: [
            {
                path: '/',
                element: <Homepage />,
            },
            {
                path: '/login',
                element: <Loginpage />,
            },
            {
                path: '/passkey-login',
                element: <PasskeyLoginpage />,
            },
            {
                path: '/register',
                element: <Registerpage />,
            },
            {
                path: '/forgot-password',
                element: <ForgotPasswordpage />,
            },
            {
                path: '/enter-otp',
                element: <OtpVerificationpage />,
            },
            {
                path: '/reset-password',
                element: <ResetPasswordpage />,
            },
        ],
    },
    {
        element: <ProtectedRoutes />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboardpage />,
            },
            {
                path: '/transactions',
                element: <Transactionpage />,
            },
            {
                path: '/reports',
                element: <Reportpage />,
            },
            {
                path: '/reports/income-statement',
                element: <IncomeStatementpage />,
            },
            {
                path: '/reports/balance-sheet',
                element: <BalanceSheetpage />,
            },
            {
                path: '/chart-of-accounts',
                element: <ChartOfAccountspage />,
            },
            {
                path: '/settings',
                element: <Settingspage />,
            },
            {
                path: '/invoices',
                element: <Invoicepage />,
            },
            {
                path: '/expenses',
                element: <Expensespage />,
            },
            {
                path: '/documents',
                element: <Documentspage />,
            },
            {
                path: '/client-review',
                element: <ClientReviewpage />,
            },
        ],
    },
]);

export default routes;
