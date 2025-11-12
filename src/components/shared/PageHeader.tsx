import { useEffect, useRef, useState } from 'react';
import {
    FaChevronDown,
    FaCog,
    FaSignOutAlt,
    FaUser,
    FaUserCircle,
} from 'react-icons/fa';
import { LOGOUT_ITEM, USER_NAME } from '../../constants';

const PageHeader = ({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Close on escape key
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setIsMenuOpen(false);
                }
            };
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isMenuOpen]);

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log('Logout clicked');
        setIsMenuOpen(false);
        // Example: navigate('/login');
    };

    const menuItems = [
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
            onClick: handleLogout,
            isDanger: true,
        },
    ];

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col justify-between">
                <h1 className="text-2xl font-bold text-primary">{title}</h1>
                <p className="text-sm text-primary-50 mt-1">{subtitle}</p>
            </div>

            {/* Avatar Dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="User menu"
                    aria-expanded={isMenuOpen}
                >
                    <div className="w-10 h-10 rounded-full bg-primary-10 flex items-center justify-center text-primary border-2 border-primary-20 hover:border-primary transition-colors">
                        <FaUser className="w-5 h-5" />
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
                                    key={index}
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
        </div>
    );
};

export default PageHeader;
