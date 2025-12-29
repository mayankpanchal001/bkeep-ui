import { useEffect, useState, type ReactNode } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useLocation } from 'react-router';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import { PAGE_HEADERS } from '../homepage/constants';
import AddNewModal from '../shared/AddNewModal';
import CommandPalette from '../shared/CommandPalette';
import Loading from '../shared/Loading';
import MobileOffcanvas from '../shared/MobileOffcanvas';
import Navbar from '../shared/Navbar';
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
    const currentHeader = PAGE_HEADERS.find(
        (header) => header.path === location.pathname
    );

    return (
        <main className="protected-route">
            <div className="protected-route-wrapper relative">
                {shouldShowLoading && <Loading />}

                {/* Desktop Sidebar */}
                <Sidebar collapsed={isSidebarCollapsed} />

                {/* Main Content Area */}
                <div className="flex-1 flex max-lg:py-16 flex-col h-full overflow-hidden relative">
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

                    {/* <div
                        className="protected-route-content relative flex flex-col"
                        data-tenant-id={selectedTenant?.id || 'default'}
                    >
                        <div
                            key={selectedTenant?.id || 'default-tenant'}
                            className="flex-1"
                        >
                           {currentHeader && (
                                <PageHeader
                                    title={currentHeader.title}
                                    subtitle={currentHeader.subtitle}
                                />
                            )}
                            <div className="p-4 overflow-auto">{children}</div>
                        </div>
                    </div> */}
                    {currentHeader && (
                        <PageHeader
                            title={currentHeader.title}
                            subtitle={currentHeader.subtitle}
                        />
                    )}
                    <div
                        className="protected-route-content relative flex flex-col"
                        data-tenant-id={selectedTenant?.id || 'default'}
                    >
                        {children}
                    </div>

                    <div className="absolute bottom-4 right-4 z-30">
                        <button
                            onClick={() => setShowAddNewModal(true)}
                            className="cursor-pointer group flex items-center justify-center bg-primary text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:pr-5"
                        >
                            <FaPlus className="w-3 h-3" />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[100px] group-hover:ml-2 group-hover:opacity-100 transition-all duration-300 ease-in-out font-medium text-xs">
                                Add New
                            </span>
                        </button>
                    </div>
                </div>

                <AddNewModal
                    isOpen={showAddNewModal}
                    onClose={() => setShowAddNewModal(false)}
                />

                {/* Mobile Offcanvas (Right Side) */}
                <div className="md:hidden">
                    <MobileOffcanvas
                        isOpen={showMobileMenu}
                        onClose={() => setShowMobileMenu(false)}
                    />
                </div>
            </div>
        </main>
    );
};

export default ProtectedLayout;
