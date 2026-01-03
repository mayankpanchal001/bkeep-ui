import { Navigate, Outlet } from 'react-router';
import { useThemeSync } from '../hooks/useThemeSync';
import { useAuth } from '../stores/auth/authSelectore';
import PublicLayout from '/src/components/layouts/PublicLayout';
import Loading from '/src/components/shared/Loading';
import SEOUpdater from '/src/components/shared/SEOUpdater';

const PublicRoutes = () => {
    useThemeSync();
    const { accessToken, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (accessToken) {
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
