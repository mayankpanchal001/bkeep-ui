import { SidebarTrigger } from '../ui/sidebar';
import { Icons } from './Icons';
import { ThemeOnOffToggle } from './ThemeSwitcher';

interface NavbarProps {
    onSearchClick?: () => void;
}

const Navbar = ({ onSearchClick }: NavbarProps) => {
    return (
        <nav className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-primary/10 sticky top-0 z-40 w-full">
            {/* Left Actions: Toggle + Search */}
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />

                <button
                    onClick={onSearchClick}
                    className="w-[min(150px,30vw)] flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-primary/10 rounded-md border border-primary/10 text-primary/50 transition-colors group"
                >
                    <Icons.Search className="w-3.5 h-3.5 group-hover:text-primary" />
                    <span className="text-xs font-medium">Search</span>
                    <kbd className="ml-auto inline-block px-1.5 py-0.5 text-[10px] font-bold text-primary/40 bg-white border border-primary/10 rounded shadow-sm">
                        ⌘K
                    </kbd>
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 min-w-fit">
                <ThemeOnOffToggle />
            </div>
        </nav>
    );
};

export default Navbar;
