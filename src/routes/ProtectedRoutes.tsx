import { Navigate, Outlet } from 'react-router';
import ProtectedLayout from '../components/layouts/ProtectedLayout';
import { useAuth } from '../stores/auth/authSelectore';

const ProtectedRoutes = () => {
    const { accessToken, loading } = useAuth();

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ProtectedLayout showLoading={loading}>
            <Outlet />
        </ProtectedLayout>
    );
};

export default ProtectedRoutes;
