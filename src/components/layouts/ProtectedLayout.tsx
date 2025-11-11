import Bottombar from '../shared/Bottombar';
import Loading from '../shared/Loading';
import Sidebar from '../shared/Sidebar';
import Topbar from '../shared/Topbar';

const ProtectedLayout = ({
    children,
    showLoading = false,
}: {
    children: React.ReactNode;
    showLoading?: boolean;
}) => {
    return (
        <main className="protected-route">
            <div className="protected-route-wrapper relative">
                {showLoading && <Loading />}
                <Topbar />
                <Sidebar collapsed={false} />
                {/* <div className="vertical-divider hidden lg:block"></div> */}
                <div className="protected-route-content relative">
                    {children}
                </div>
                <Bottombar />
            </div>
        </main>
    );
};

export default ProtectedLayout;
