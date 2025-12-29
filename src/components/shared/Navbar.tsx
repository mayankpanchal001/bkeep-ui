import { Icons } from './Icons';
import TenantSwitcher from './TenantSwitcher';

interface NavbarProps {
    onSearchClick?: () => void;
    onToggleSidebar?: () => void;
    isSidebarCollapsed?: boolean;
}

const Navbar = ({ onSearchClick, onToggleSidebar }: NavbarProps) => {
    return (
        <nav className="hidden lg:flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-primary-10 sticky top-0 z-40">
            {/* Left Actions: Toggle + Search */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-primary-50 hover:text-primary hover:bg-primary-5 rounded-md transition-colors"
                >
                    <Icons.Menu className="w-4 h-4" />
                </button>

                <button
                    onClick={onSearchClick}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-gray-500 transition-colors group"
                >
                    <Icons.Search className="w-3.5 h-3.5 group-hover:text-primary" />
                    <span className="text-xs font-medium">Search</span>
                    <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 rounded shadow-sm">
                        ⌘K
                    </kbd>
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 min-w-fit">
                <TenantSwitcher />
            </div>
        </nav>
    );
};

export default Navbar;
