import { Link, useNavigate } from 'react-router';
import { useLogout } from '../../services/apis/authApi';
import { useAuth } from '../../stores/auth/authSelectore';
import { showSuccessToast } from '../../utills/toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SidebarTrigger } from '../ui/sidebar';
import { Icons } from './Icons';
import { ThemeOnOffToggle } from './ThemeSwitcher';

interface NavbarProps {
    onSearchClick?: () => void;
}

const Navbar = ({ onSearchClick }: NavbarProps) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { mutate: logout } = useLogout();

    const initials =
        (user?.name || '')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';

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
                <Link
                    to="/settings/notifications"
                    className="relative p-2 rounded-md hover:bg-primary/10 text-primary/70"
                    aria-label="Notifications"
                >
                    <Icons.Notifications className="w-5 h-5" />
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-primary/10 border border-primary/10 text-primary/80"
                            aria-label="User menu"
                        >
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {initials}
                            </div>
                            <Icons.ChevronDown className="w-4 h-4 text-primary/50" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72" align="end">
                        <DropdownMenuLabel>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-primary truncate">
                                        {user?.name || 'User'}
                                    </div>
                                    <div className="text-xs text-primary/60 truncate">
                                        {user?.email || 'user@example.com'}
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigate('/settings/profile')}
                        >
                            <Icons.Profile className="mr-2 h-4 w-4" />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                showSuccessToast('Billing coming soon')
                            }
                        >
                            <Icons.Billing className="mr-2 h-4 w-4" />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => navigate('/settings/notifications')}
                        >
                            <Icons.Notifications className="mr-2 h-4 w-4" />
                            Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()}>
                            <Icons.Logout className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default Navbar;
