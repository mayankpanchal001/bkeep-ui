import { useEffect, useState, type ReactNode } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useLocation } from 'react-router';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import AddNewModal from '../shared/AddNewModal';
import Bottombar from '../shared/Bottombar';
import CommandPalette from '../shared/CommandPalette';
import Loading from '../shared/Loading';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';
import Topbar from '../shared/Topbar';
import Button from '../typography/Button';

const ProtectedLayout = ({
    children,
    showLoading = false,
}: {
    children: ReactNode;
    showLoading?: boolean;
}) => {
    const location = useLocation();
    const { selectedTenant } = useTenant();
    const [routeLoading, setRouteLoading] = useState(false);
    const [showAddNewModal, setShowAddNewModal] = useState(false);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        setRouteLoading(true);
        const timeout = setTimeout(() => setRouteLoading(false), 300);

        return () => clearTimeout(timeout);
    }, [location.pathname]);

    // Command Palette Shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const shouldShowLoading = showLoading || routeLoading;
    // const currentHeader = PAGE_HEADERS.find(
    //     (header) => header.path === location.pathname
    // );

    return (
        <main className="protected-route">
            <div className="protected-route-wrapper relative">
                {shouldShowLoading && <Loading />}

                {/* Desktop Sidebar */}
                <Sidebar collapsed={isSidebarCollapsed} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {/* Mobile Topbar */}
                    <Topbar onMenuClick={() => setShowMobileMenu(true)} />

                    {/* Desktop Navbar */}
                    <Navbar
                        onSearchClick={() => setShowCommandPalette(true)}
                        onToggleSidebar={() =>
                            setIsSidebarCollapsed(!isSidebarCollapsed)
                        }
                        isSidebarCollapsed={isSidebarCollapsed}
                    />

                    <CommandPalette
                        isOpen={showCommandPalette}
                        onClose={() => setShowCommandPalette(false)}
                    />

                    <div
                        className="protected-route-content relative flex flex-col"
                        data-tenant-id={selectedTenant?.id || 'default'}
                    >
                        <div
                            key={selectedTenant?.id || 'default-tenant'}
                            className="flex-1"
                        >
                            {/* {currentHeader && (
                                <PageHeader
                                    title={currentHeader.title}
                                    subtitle={currentHeader.subtitle}
                                />
                            )} */}
                            <div className="p-2 sm:p-4 overflow-auto">
                                {children}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 right-8 z-30">
                        <Button
                            size="md"
                            isRounded={true}
                            onClick={() => setShowAddNewModal(true)}
                            className="shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <FaPlus className="mr-2" />
                            Add New
                        </Button>
                    </div>
                </div>

                <AddNewModal
                    isOpen={showAddNewModal}
                    onClose={() => setShowAddNewModal(false)}
                />

                {/* Mobile Bottom Bar (Sheet) */}
                <div className="md:hidden">
                    <Bottombar
                        isOpen={showMobileMenu}
                        onClose={() => setShowMobileMenu(false)}
                    />
                </div>
            </div>
        </main>
    );
};

export default ProtectedLayout;
