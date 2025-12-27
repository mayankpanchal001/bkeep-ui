import { useEffect, useState, type ReactNode } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useLocation } from 'react-router';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import { PAGE_HEADERS } from '../homepage/constants';
import AddNewModal from '../shared/AddNewModal';
import Bottombar from '../shared/Bottombar';
import CommandPalette from '../shared/CommandPalette';
import FloatingDock from '../shared/FloatingDock';
import Loading from '../shared/Loading';
import Navbar from '../shared/Navbar';
import PageHeader from '../shared/PageHeader';
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
    const [showDock, setShowDock] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

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

                {/* Mobile Topbar */}
                <Topbar onMenuClick={() => setShowMobileMenu(true)} />

                {/* Desktop Navbar */}
                <Navbar
                    onSearchClick={() => setShowCommandPalette(true)}
                    onToggleDock={() => setShowDock((prev) => !prev)}
                    isDockVisible={showDock}
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
                        {currentHeader && (
                            <PageHeader
                                title={currentHeader.title}
                                subtitle={currentHeader.subtitle}
                            />
                        )}
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
                <AddNewModal
                    isOpen={showAddNewModal}
                    onClose={() => setShowAddNewModal(false)}
                />

                {/* Floating Dock for Navigation */}
                <div
                    className={`
                        hidden md:block transition-all duration-300 transform
                        ${
                            showDock
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-24 opacity-0 pointer-events-none'
                        }
                    `}
                >
                    <FloatingDock />
                </div>

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
