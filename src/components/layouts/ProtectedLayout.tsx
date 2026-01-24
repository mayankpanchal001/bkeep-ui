import { Plus } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import AddNewModal from '../shared/AddNewModal';
import { AppSidebar } from '../shared/AppSidebar';
import CommandPalette from '../shared/CommandPalette';
import KeyboardShortcuts from '../shared/KeyboardShortcuts';
import Loading from '../shared/Loading';
import Navbar from '../shared/Navbar';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';

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
    const [showShortcuts, setShowShortcuts] = useState(false);

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
                return;
            }
            const target = e.target as HTMLElement | null;
            const isTyping =
                !!target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable);
            if (!isTyping && ((e.shiftKey && e.key === '/') || e.key === '?')) {
                e.preventDefault();
                setShowShortcuts(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const shouldShowLoading = showLoading || routeLoading;

    return (
        <SidebarProvider>
            <main className="protected-route w-full flex min-h-screen">
                <div className="protected-route-wrapper relative flex w-full">
                    {shouldShowLoading && <Loading />}

                    {/* App Sidebar */}
                    <AppSidebar />

                    {/* Main Content Area */}
                    <SidebarInset className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
                        {/* Desktop Navbar */}

                        <Navbar
                            onSearchClick={() => setShowCommandPalette(true)}
                            onShortcutsClick={() => setShowShortcuts(true)}
                        // onToggleSidebar is handled by SidebarTrigger/Provider now
                        />

                        <CommandPalette
                            isOpen={showCommandPalette}
                            onClose={() => setShowCommandPalette(false)}
                            onOpenShortcuts={() => setShowShortcuts(true)}
                        />
                        <KeyboardShortcuts
                            isOpen={showShortcuts}
                            onClose={() => setShowShortcuts(false)}
                        />

                        <div
                            className="protected-route-content relative flex flex-col flex-1 p-4 overflow-auto"
                            data-tenant-id={selectedTenant?.id || 'default'}
                        >
                            {children}
                        </div>

                        <div className="fixed bottom-4 right-4 z-30">
                            <button
                                onClick={() => setShowAddNewModal(true)}
                                className="cursor-pointer group flex items-center justify-center bg-primary text-white rounded-full p-2  transition-all duration-300 ease-in-out hover:pr-5"
                            >
                                <Plus className="w-3 h-3" />
                                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-[100px] group-hover:ml-2 group-hover:opacity-100 transition-all duration-300 ease-in-out font-medium text-xs">
                                    Add New
                                </span>
                            </button>
                        </div>
                    </SidebarInset>

                    <AddNewModal
                        isOpen={showAddNewModal}
                        onClose={() => setShowAddNewModal(false)}
                    />
                </div>
            </main>
        </SidebarProvider>
    );
};

export default ProtectedLayout;
