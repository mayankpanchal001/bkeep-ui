import { FaSearch, FaTh } from 'react-icons/fa';
import { APP_TITLE } from '../../constants';
import { LOGO_IMAGE } from '../../constants/images';
import PageHeaderMenu from './PageHeaderMenu';
import TenantSwitcher from './TenantSwitcher';

interface NavbarProps {
    onSearchClick?: () => void;
    onToggleDock?: () => void;
    isDockVisible?: boolean;
}

const Navbar = ({
    onSearchClick,
    onToggleDock,
    isDockVisible,
}: NavbarProps) => {
    return (
        <nav className="hidden lg:flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-primary-10 sticky top-0 z-40">
            {/* Logo Section */}
            <div className="flex items-center gap-3 min-w-fit">
                <img src={LOGO_IMAGE} alt="logo" className="w-8 h-8" />
                <span className="text-lg font-bold text-primary">
                    {APP_TITLE}
                </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 min-w-fit">
                <button
                    onClick={onToggleDock}
                    className={`
                        relative group flex items-center justify-center w-8 h-8 rounded-md transition-colors
                        ${
                            isDockVisible
                                ? 'bg-primary-10 text-primary'
                                : 'text-primary-50 hover:bg-primary-5 hover:text-primary'
                        }
                    `}
                >
                    <FaTh className="w-4 h-4" />

                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
                        Toggle Menu
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                    </div>
                </button>
                <div className="h-6 w-px bg-primary-10 mx-2"></div>
                <button
                    onClick={onSearchClick}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-gray-500 transition-colors group"
                >
                    <FaSearch className="w-3.5 h-3.5 group-hover:text-primary" />
                    <span className="text-xs font-medium">Search</span>
                    <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded shadow-sm">
                        ⌘K
                    </kbd>
                </button>
                <div className="h-6 w-px bg-primary-10 mx-2"></div>
                <TenantSwitcher />
                <div className="h-6 w-px bg-primary-10 ml-2"></div>
                <PageHeaderMenu />
            </div>
        </nav>
    );
};

export default Navbar;
