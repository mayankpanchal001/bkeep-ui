import { Navigate, Outlet } from 'react-router';
import PublicLayout from '../components/layouts/PublicLayout';
import Loading from '../components/shared/Loading';
import { useAuth } from '../stores/auth/authSelectore';

const PublicRoutes = () => {
    const { accessToken, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (accessToken) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <PublicLayout>
            <Outlet />
        </PublicLayout>
    );
};

export default PublicRoutes;
