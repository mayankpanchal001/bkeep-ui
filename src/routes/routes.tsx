import { createBrowserRouter } from 'react-router';
import Dashboardpage from '../pages/protected/Dashboardpage';

import Reportpage from '../pages/protected/Reportpage';
import Transactionpage from '../pages/protected/Transactionpage';
import Homepage from '../pages/public/Homepage';
import Loginpage from '../pages/public/Loginpage';
import Registerpage from '../pages/public/Registerpage';
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
                path: '/register',
                element: <Registerpage />,
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
        ],
    },
]);

export default routes;
