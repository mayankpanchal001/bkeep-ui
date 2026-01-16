import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { APP_TITLE, SIDEBAR_ITEMS } from '../../constants';
import { LOGO_IMAGE } from '../../constants/images';
import { useLogout } from '../../services/apis/authApi';
import { useAuth } from '../../stores/auth/authSelectore';
import { Icons } from '../shared/Icons';

const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const location = useLocation();
    const { user } = useAuth();
    const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const menuRef = useRef<HTMLDivElement>(null);
    const menuContentRef = useRef<HTMLDivElement>(null);

    // Calculate menu position
    useLayoutEffect(() => {
        if (isMenuOpen && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();

            if (collapsed) {
                // Collapsed: Show to the right
                setMenuStyle({
                    position: 'fixed',
                    left: `${rect.right + 8}px`,
                    bottom: `${window.innerHeight - rect.bottom}px`,
                    zIndex: 9999,
                    minWidth: '240px',
                });
            } else {
                // Expanded: Show above (Dropup)
                setMenuStyle({
                    position: 'fixed',
                    left: `${rect.left}px`,
                    bottom: `${window.innerHeight - rect.top + 8}px`,
                    width: `${rect.width}px`,
                    zIndex: 9999,
                });
            }
        }
    }, [isMenuOpen, collapsed]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                menuContentRef.current &&
                !menuContentRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    // Check if a sidebar item should be active
    const isItemActive = useCallback(
        (itemPath: string | undefined) => {
            if (!itemPath) return false;
            if (location.pathname === itemPath) return true;
            if (location.pathname.startsWith(itemPath + '/')) {
                return true;
            }
            return false;
        },
        [location.pathname]
    );

    // Auto-expand groups if child is active
    useEffect(() => {
        const groupsToExpand: string[] = [];

        SIDEBAR_ITEMS.forEach((item) => {
            if (
                item.children &&
                item.children.some((child) => isItemActive(child.path))
            ) {
                groupsToExpand.push(item.label);
            }
        });

        if (groupsToExpand.length > 0) {
            setExpandedItems((prev) => {
                const newSet = new Set(prev);
                let hasChanges = false;
                groupsToExpand.forEach((label) => {
                    if (!newSet.has(label)) {
                        newSet.add(label);
                        hasChanges = true;
                    }
                });
                return hasChanges ? Array.from(newSet) : prev;
            });
        }
    }, [location.pathname, isItemActive]);

    const toggleExpand = (label: string) => {
        if (collapsed) return; // Don't toggle if sidebar is collapsed
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((l) => l !== label)
                : [...prev, label]
        );
    };

    const handleLogoutClick = () => {
        setIsMenuOpen(false);
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = async () => {
        await logout();
        setShowLogoutConfirm(false);
    };

    return (
        <div
            className={`protected-route-sidebar ${collapsed ? 'collapsed' : ''}`}
        >
            <div className="sidebar-header">
                <div className="sidebar-header-logo">
                    <img src={LOGO_IMAGE} alt="logo" className="w-10 h-10" />
                    <span className="sidebar-header-title-text">
                        {APP_TITLE}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto py-4">
                <div className="sidebar-items flex-1">
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = isItemActive(item.path);
                        const isExpanded = expandedItems.includes(item.label);
                        const hasChildren =
                            item.children && item.children.length > 0;

                        if (hasChildren) {
                            return (
                                <div key={item.label} className="flex flex-col">
                                    <div
                                        className={`sidebar-item ${isActive ? 'active' : ''} justify-between`}
                                        onClick={() => toggleExpand(item.label)}
                                        title={collapsed ? item.label : ''}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="sidebar-item-icon">
                                                {item.icon}
                                            </span>
                                            <span className="sidebar-item-label">
                                                {item.label}
                                            </span>
                                        </div>
                                        {!collapsed && (
                                            <span className="text-primary/40 text-xs">
                                                {isExpanded ? (
                                                    <Icons.ChevronDown />
                                                ) : (
                                                    <Icons.ChevronRight />
                                                )}
                                            </span>
                                        )}
                                        {!collapsed && isActive && (
                                            <div className="ml-auto w-1 h-8 bg-primary rounded-l-full absolute right-0"></div>
                                        )}
                                    </div>

                                    {/* Children */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            isExpanded && !collapsed
                                                ? 'max-h-96 opacity-100'
                                                : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-1 mt-1 ml-4 border-l border-primary/10 pl-2">
                                            {item.children?.map((child) => (
                                                <Link
                                                    key={child.label}
                                                    to={child.path || '#'}
                                                    className={`sidebar-item min-h-[32px] py-1 ${
                                                        isItemActive(child.path)
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                >
                                                    <span className="sidebar-item-label text-xs">
                                                        {child.label}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                to={item.path || '/dashboard'}
                                key={item.label}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="sidebar-item-icon">
                                    {item.icon}
                                </span>
                                <span className="sidebar-item-label">
                                    {item.label}
                                </span>
                                {!collapsed && isActive && (
                                    <div className="ml-auto w-1 h-8 bg-primary rounded-l-full absolute right-0"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* User Profile Section */}
            <div className="p-2 mt-auto" ref={menuRef}>
                <div className="relative">
                    {/* Menu Popup */}
                    {isMenuOpen &&
                        createPortal(
                            <div
                                ref={menuContentRef}
                                style={menuStyle}
                                className="bg-card rounded-lg shadow-xl border border-primary/10 py-1"
                            >
                                {/* User Info Header in Menu */}
                                <div className="px-4 py-3 border-b border-primary/10 mb-1 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-primary truncate">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-primary/50 truncate">
                                            {user?.email || 'user@example.com'}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary/70 hover:bg-primary/10 rounded-md transition-colors">
                                        <Icons.Profile className="w-4 h-4" />{' '}
                                        Profile
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary/70 hover:bg-primary/10 rounded-md transition-colors">
                                        <Icons.Billing className="w-4 h-4" />{' '}
                                        Billing
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary/70 hover:bg-primary/10 rounded-md transition-colors">
                                        <Icons.Notifications className="w-4 h-4" />{' '}
                                        Notifications
                                    </button>
                                </div>

                                <div className="h-px bg-primary/10 my-1 mx-1" />

                                <div className="px-1">
                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary/70 hover:bg-primary/10 rounded-md transition-colors"
                                    >
                                        <Icons.Logout className="w-4 h-4" /> Log
                                        out
                                    </button>
                                </div>
                            </div>,
                            document.body
                        )}

                    {/* Trigger Area */}
                    <div
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group ${collapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            {user?.name?.charAt(0) || 'U'}
                        </div>

                        {!collapsed && (
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-primary truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-primary/50 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        )}

                        {!collapsed && (
                            <Icons.ChevronsUpDown className="w-4 h-4 text-primary/40" />
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog
                open={showLogoutConfirm}
                onOpenChange={setShowLogoutConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will need to sign in again to access your
                            workspace.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmLogout}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isLoggingOut ? 'Signing out...' : 'Sign out'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Sidebar;
