import { Outlet } from 'react-router';
import ProtectedLayout from '../components/layouts/ProtectedLayout';

const ProtectedRoutes = () => {
    // const { accessToken, loading } = useAuth();

    // if (!accessToken) {
    //     return <Navigate to="/login" replace />;
    // }

    return (
        <ProtectedLayout showLoading={loading}>
            <Outlet />
        </ProtectedLayout>
    );
};

export default ProtectedRoutes;
