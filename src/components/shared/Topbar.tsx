import { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaUser } from 'react-icons/fa';
import { Link } from 'react-router';
import { APP_TITLE, LOGOUT_ITEM, USER_NAME } from '../../constants';
import logo from '/logo.png';

const Topbar = () => {
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
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log('Logout clicked');
        setIsMenuOpen(false);
    };

    return (
        <div className="protected-route-topbar">
            <div className="topbar-content">
                {/* Logo Section */}
                <div className="topbar-logo">
                    <img
                        src={logo}
                        alt="BKeep Accounting Logo"
                        className="w-8 h-8 object-contain"
                    />
                    <span className="topbar-logo-text">{APP_TITLE}</span>
                </div>

                {/* Avatar Section */}
                <div className="topbar-avatar-container" ref={menuRef}>
                    <button
                        className="topbar-avatar-button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className="topbar-avatar">
                            <FaUser className="w-5 h-5" />
                        </div>
                        <span className="topbar-avatar-name">{USER_NAME}</span>
                        <FaChevronDown
                            className={`topbar-avatar-chevron ${
                                isMenuOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="topbar-dropdown">
                            <div className="topbar-dropdown-header">
                                <div className="topbar-dropdown-avatar">
                                    <FaUser className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="topbar-dropdown-name">
                                        {USER_NAME}
                                    </p>
                                    <p className="topbar-dropdown-email">
                                        user@example.com
                                    </p>
                                </div>
                            </div>
                            <div className="topbar-dropdown-divider"></div>
                            <Link
                                to={LOGOUT_ITEM.path}
                                className="topbar-dropdown-item"
                                onClick={handleLogout}
                            >
                                <span className="topbar-dropdown-icon">
                                    {LOGOUT_ITEM.icon}
                                </span>
                                <span>{LOGOUT_ITEM.label}</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Topbar;
