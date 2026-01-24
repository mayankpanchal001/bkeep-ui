import { Navigate, Outlet, useLocation } from 'react-router';
import { useThemeSync } from '../hooks/useThemeSync';
import { AuthStore } from '../stores/auth/authStore';
import { useAuth } from '../stores/auth/authSelectore';
import PublicLayout from '@/components/layouts/PublicLayout';
import Loading from '@/components/shared/Loading';
import SEOUpdater from '@/components/shared/SEOUpdater';

const PublicRoutes = () => {
    useThemeSync();
    const location = useLocation();
    const { accessToken, loading } = useAuth();

    // If user is on accept-invitation page and is authenticated, logout first
    if (location.pathname === '/accept-invitation' && accessToken) {
        AuthStore.getState().clearAuth();
    }

    if (loading) {
        return <Loading />;
    }

    // Don't redirect if on accept-invitation page (let it handle its own flow)
    if (accessToken && location.pathname !== '/accept-invitation') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <>
            <SEOUpdater />
            <PublicLayout>
                <Outlet />
            </PublicLayout>
        </>
    );
};

export default PublicRoutes;
