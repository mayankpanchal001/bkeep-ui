import { Icons } from '@/components/shared/Icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useLogout } from '@/services/apis/authApi';
import { useAuth } from '@/stores/auth/authSelectore';
import { ChevronsUpDown } from 'lucide-react';
import { Link } from 'react-router';

export function SidebarUserMenu() {
    const { user } = useAuth();
    const { mutateAsync: logout } = useLogout();
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
                        >
                            <Avatar className="size-8 rounded-lg">
                                <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                                    {user?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-sidebar-foreground">
                                    {user?.name || 'User'}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user?.email || 'user@example.com'}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-popover text-popover-foreground border-border"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">
                                        {user?.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user?.name || 'User'}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {user?.email || 'user@example.com'}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                            <Link
                                to="/settings/profile"
                                className="w-full flex gap-2 items-center"
                                onClick={() => {
                                    if (isMobile) setOpenMobile(false);
                                }}
                            >
                                <Icons.Profile className="h-4 w-4 text-muted-foreground" />
                                Profile
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                            <Link
                                to="/settings/notifications"
                                className="w-full flex gap-2 items-center"
                                onClick={() => {
                                    if (isMobile) setOpenMobile(false);
                                }}
                            >
                                <Icons.Notifications className="h-4 w-4 text-muted-foreground" />
                                Notifications
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive"
                            onClick={() => {
                                if (isMobile) setOpenMobile(false);
                                logout();
                            }}
                        >
                            <Icons.Logout className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
