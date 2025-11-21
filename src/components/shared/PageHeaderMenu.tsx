import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
    FaChevronDown,
    FaCog,
    FaSignOutAlt,
    FaUser,
    FaUserCircle,
} from 'react-icons/fa';
import { LOGOUT_ITEM, USER_NAME } from '../../constants';
import { useLogout } from '../../services/apis/authApi';
import { useAuth } from '../../stores/auth/authSelectore';

type MenuItem = {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    isDanger?: boolean;
};

const PageHeaderMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const hasLoggedUser = useRef(false);
    const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        if (!hasLoggedUser.current) {
            console.log('User info:', user);
            hasLoggedUser.current = true;
        }
    }, [user]);

    const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);

    const handleLogoutClick = () => {
        setIsMenuOpen(false);
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = async () => {
        try {
            await logout();
        } finally {
            setShowLogoutConfirm(false);
        }
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const menuItems: MenuItem[] = [
        {
            label: 'Profile',
            icon: <FaUserCircle className="w-4 h-4" />,
            onClick: () => {
                console.log('Profile clicked');
                setIsMenuOpen(false);
            },
        },
        {
            label: 'Settings',
            icon: <FaCog className="w-4 h-4" />,
            onClick: () => {
                console.log('Settings clicked');
                setIsMenuOpen(false);
            },
        },
        {
            label: LOGOUT_ITEM.label,
            icon: <FaSignOutAlt className="w-4 h-4" />,
            onClick: handleLogoutClick,
            isDanger: true,
        },
    ];

    return (
        <>
            {/* Avatar Dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={handleToggleMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-10 transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-2"
                    aria-label="User menu"
                    aria-expanded={isMenuOpen}
                >
                    <div className="w-8 h-8 rounded-full bg-primary-10 flex items-center justify-center text-primary border-2 border-primary-20 hover:border-primary transition-colors">
                        <FaUser className="w-4 h-4" />
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium text-primary">
                            {USER_NAME}
                        </span>
                        <span className="text-xs text-primary-50">
                            user@example.com
                        </span>
                    </div>
                    <FaChevronDown
                        className={`w-4 h-4 text-primary-50 transition-transform duration-200 ${
                            isMenuOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>
                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-primary-10 py-2 z-50 dropdown-animate">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-primary-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary-10 flex items-center justify-center text-primary border-2 border-primary-20">
                                    <FaUser className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-primary truncate">
                                        {USER_NAME}
                                    </p>
                                    <p className="text-xs text-primary-50 truncate">
                                        user@example.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            {menuItems.map((item, index) => (
                                <button
                                    key={`${item.label}-${index}`}
                                    onClick={item.onClick}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        item.isDanger
                                            ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                            : 'text-primary-75 hover:bg-primary-10 hover:text-primary'
                                    }`}
                                >
                                    <span className="shrink-0">
                                        {item.icon}
                                    </span>
                                    <span className="text-left">
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-primary">
                            Sign out?
                        </h3>
                        <p className="mt-2 text-sm text-primary-75">
                            You will need to sign in again to access your
                            workspace.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                className="rounded-xl border border-primary-10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-10"
                                onClick={handleCancelLogout}
                                disabled={isLoggingOut}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-75 disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={handleConfirmLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? 'Signing out...' : 'Sign out'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PageHeaderMenu;
