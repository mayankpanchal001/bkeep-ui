import { FaTh } from 'react-icons/fa';
import { APP_TITLE } from '../../constants';
import PageHeaderMenu from './PageHeaderMenu';
import TenantSwitcher from './TenantSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import logo from '/logo.png';

interface TopbarProps {
    onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
    return (
        <div className="protected-route-topbar">
            <div className="topbar-content">
                <div className="flex items-center gap-3">
                    <div className="topbar-logo">
                        <img
                            src={logo}
                            alt="BKeep Accounting Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="topbar-logo-text">{APP_TITLE}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <TenantSwitcher />
                        <ThemeSwitcher />
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onMenuClick}
                            className="p-2 pl-4 text-primary-50 hover:text-primary transition-colors lg:hidden"
                            aria-label="Toggle Menu"
                        >
                            <FaTh className="w-4 h-4" />
                        </button>
                        <div className="h-6 w-px bg-primary-10 ml-2"></div>
                        <div className="inline-block lg:hidden">
                            <PageHeaderMenu />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
