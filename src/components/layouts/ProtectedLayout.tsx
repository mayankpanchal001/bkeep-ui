import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { PAGE_HEADERS } from '../homepage/constants';
import Bottombar from '../shared/Bottombar';
import Loading from '../shared/Loading';
import PageHeader from '../shared/PageHeader';
import Sidebar from '../shared/Sidebar';
import Topbar from '../shared/Topbar';

const ProtectedLayout = ({
    children,
    showLoading = false,
}: {
    children: ReactNode;
    showLoading?: boolean;
}) => {
    const location = useLocation();
    const currentHeader = PAGE_HEADERS.find(
        (header) => header.path === location.pathname
    );

    return (
        <main className="protected-route">
            <div className="protected-route-wrapper relative">
                {showLoading && <Loading />}
                <Topbar />
                <Sidebar collapsed={false} />

                <div className="protected-route-content relative">
                    {currentHeader && (
                        <PageHeader
                            title={currentHeader.title}
                            subtitle={currentHeader.subtitle}
                        />
                    )}
                    <div className="p-4 sm:h-[calc(100vh-100px)] overflow-auto">
                        {children}
                    </div>
                </div>

                <Bottombar />
            </div>
        </main>
    );
};

export default ProtectedLayout;
