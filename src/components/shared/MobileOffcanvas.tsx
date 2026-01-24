import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { APP_TITLE, SIDEBAR_ITEMS } from '../../constants';
import { LOGO_IMAGE } from '../../constants/images';
import { useLogout } from '../../services/apis/authApi';
import { useAuth } from '../../stores/auth/authSelectore';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { Icons } from '../shared/Icons';

interface MobileOffcanvasProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileOffcanvas = ({ isOpen, onClose }: MobileOffcanvasProps) => {
    const location = useLocation();
    const { user } = useAuth();
    const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const LS_FAV_KEY = 'bkeep-report-favourites';
    const LS_FAV_LABEL_KEY = 'bkeep-report-favourites-labels';
    type FavLink = { label: string; path: string };
    const [favLinks, setFavLinks] = useState<FavLink[]>([]);

    useEffect(() => {
        const read = (): FavLink[] => {
            try {
                const raw = localStorage.getItem(LS_FAV_KEY);
                const favs: string[] = raw ? JSON.parse(raw) : [];
                const rawLabels = localStorage.getItem(LS_FAV_LABEL_KEY);
                const labels: Record<string, string> = rawLabels
                    ? JSON.parse(rawLabels)
                    : {};
                if (!Array.isArray(favs)) return [];
                const toTitle = (s: string) =>
                    s
                        .split('-')
                        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                        .join(' ');
                const links: FavLink[] = favs.map((id) => {
                    const [category, report] = id.split(':');
                    const label = labels[id] || toTitle(report || id);
                    const path = `/reports/${category}/${report}`;
                    return { label, path };
                });
                return links;
            } catch {
                return [];
            }
        };
        setFavLinks(read());
        const onStorage = (e: StorageEvent) => {
            if (e.key === LS_FAV_KEY || e.key === LS_FAV_LABEL_KEY) {
                setFavLinks(read());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Check if item is active
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
        // Ensure Reports expands when visiting a dynamic detail route
        if (location.pathname.startsWith('/reports/')) {
            setExpandedItems((prev) =>
                prev.includes('Reports') ? prev : [...prev, 'Reports']
            );
        }
    }, [location.pathname, isItemActive]);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((l) => l !== label)
                : [...prev, label]
        );
    };

    const handleConfirmLogout = async () => {
        await logout();
        setShowLogoutConfirm(false);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`
                    fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={onClose}
            />

            {/* Offcanvas Panel (Right Side) */}
            <div
                className={`
                    fixed inset-y-0 right-0 z-50 w-80 bg-card transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/10">
                    <div className="flex items-center gap-2">
                        <img src={LOGO_IMAGE} alt="logo" className="w-8 h-8" />
                        <span className="font-bold text-lg text-primary">
                            {APP_TITLE}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-primary/50 hover:text-primary transition-colors rounded-full hover:bg-primary/5"
                    >
                        <Icons.ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="flex flex-col gap-1">
                        {SIDEBAR_ITEMS.map((item) => {
                            const isActive = isItemActive(item.path);
                            const isExpanded = expandedItems.includes(
                                item.label
                            );
                            const isReports = item.path === '/reports';
                            const computedChildren = isReports
                                ? [
                                      ...favLinks.map((f) => ({
                                          label: f.label,
                                          path: f.path,
                                      })),
                                      ...(item.children || []),
                                  ]
                                : item.children || [];
                            const hasChildren =
                                computedChildren && computedChildren.length > 0;

                            if (hasChildren) {
                                return (
                                    <div
                                        key={item.label}
                                        className="flex flex-col"
                                    >
                                        <div
                                            className={`
                                                flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors
                                                ${isActive ? 'bg-primary/5 text-primary' : 'text-primary/60 hover:bg-card'}
                                            `}
                                        >
                                            <Link
                                                to={item.path || '#'}
                                                onClick={onClose}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="text-xl">
                                                    {item.icon}
                                                </span>
                                                <span className="font-medium text-sm">
                                                    {item.label}
                                                </span>
                                            </Link>
                                            <button
                                                className="text-primary/40"
                                                onClick={() =>
                                                    toggleExpand(item.label)
                                                }
                                                aria-label="Toggle group"
                                            >
                                                {isExpanded ? (
                                                    <Icons.ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <Icons.ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Children */}
                                        <div
                                            className={`
                                                overflow-hidden transition-all duration-300 ease-in-out
                                                ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                            `}
                                        >
                                            <div className="flex flex-col gap-1 mt-1 ml-4 border-l border-primary/10 pl-2">
                                                {computedChildren.map(
                                                    (child) => (
                                                        <Link
                                                            key={child.label}
                                                            to={
                                                                child.path ||
                                                                '#'
                                                            }
                                                            onClick={onClose}
                                                            className={`
                                                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                                                            ${
                                                                isItemActive(
                                                                    child.path
                                                                )
                                                                    ? 'text-primary font-medium bg-primary/5'
                                                                    : 'text-primary/50 hover:text-primary hover:bg-card'
                                                            }
                                                        `}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    to={item.path || '/dashboard'}
                                    onClick={onClose}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                                        ${
                                            isActive
                                                ? 'bg-primary/5 text-primary font-medium'
                                                : 'text-primary/60 hover:bg-card hover:text-primary'
                                        }
                                    `}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-sm">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-primary/10 bg-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
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

                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            to="/settings/profile"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary/70 bg-card border border-primary/10 rounded-md hover:bg-card transition-colors"
                        >
                            <Icons.Profile className="w-4 h-4" />
                            Profile
                        </Link>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-card border border-primary/10 rounded-md hover:bg-red-50 transition-colors"
                        >
                            <Icons.Logout className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleConfirmLogout}
                title="Sign out?"
                message="You will need to sign in again to access your workspace."
                confirmText="Sign out"
                confirmVariant="danger"
                loading={isLoggingOut}
            />
        </>
    );
};

export default MobileOffcanvas;
