import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import ProtectedLayout from '../components/layouts/ProtectedLayout';
import { USER_NAME } from '../constants';

const ProtectedRoutes = () => {
    const { user, isLoading } = { user: USER_NAME, isLoading: false };
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const showLoading = isLoading || isTransitioning;

    return (
        <ProtectedLayout showLoading={showLoading}>
            <Outlet />
        </ProtectedLayout>
    );
};

export default ProtectedRoutes;
