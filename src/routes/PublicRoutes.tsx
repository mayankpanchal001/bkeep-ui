import { Navigate, Outlet } from 'react-router';
import PublicLayout from '../components/layouts/PublicLayout';
import Loading from '../components/shared/Loading';
import { USER_NAME } from '../constants';

const PublicRoutes = () => {
    const { user, isLoading } = { user: USER_NAME, isLoading: false };

    if (isLoading) {
        return <Loading />;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <PublicLayout>
            <Outlet />
        </PublicLayout>
    );
};

export default PublicRoutes;
