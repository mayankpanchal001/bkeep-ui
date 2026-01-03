/* eslint-disable @typescript-eslint/no-unused-vars */
import { Check, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { SIDEBAR_ITEMS } from '../../constants';
import { LOGO_IMAGE } from '../../constants/images';
import { useLogout } from '../../services/apis/authApi';
import { useSwitchTenant, useUserTenants } from '../../services/apis/tenantApi';
import { useAuth } from '../../stores/auth/authSelectore';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import { showErrorToast } from '../../utills/toast';
import { Icons } from '../shared/Icons';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '../ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation();
    const { user, setAuth } = useAuth();
    const { mutateAsync: logout } = useLogout();
    const { selectedTenant, selectTenant } = useTenant();
    const { mutateAsync: switchTenant } = useSwitchTenant();

    // Tenant Switcher Logic
    const [isSwitching, setIsSwitching] = useState(false);
    const { data: tenantsResponse, isLoading: isLoadingTenants } =
        useUserTenants({
            page: 1,
            limit: 100,
            sort: 'createdAt',
            order: 'asc',
        });

    const tenants = tenantsResponse?.data?.items || [];

    const handleTenantChange = async (tenantId: string) => {
        if (!tenantId || tenantId === selectedTenant?.id) return;

        setIsSwitching(true);
        try {
            const response = await switchTenant(tenantId);
            if (
                user &&
                response.data.accessToken &&
                response.data.refreshToken
            ) {
                const updatedUser = { ...user, selectedTenantId: tenantId };
                setAuth(
                    updatedUser,
                    response.data.accessToken,
                    response.data.refreshToken
                );
            }
            selectTenant(tenantId);
            window.location.reload();
        } catch (error) {
            console.error('Failed to switch tenant:', error);
            showErrorToast('Failed to switch tenant. Please try again.');
        } finally {
            setIsSwitching(false);
        }
    };

    const isItemActive = (itemPath: string | undefined) => {
        if (!itemPath) return false;
        if (location.pathname === itemPath) return true;
        if (location.pathname.startsWith(itemPath + '/')) {
            return true;
        }
        return false;
    };

    const isGroupActive = (item: (typeof SIDEBAR_ITEMS)[0]) => {
        if (isItemActive(item.path)) return true;
        if (item.children) {
            return item.children.some((child) => isItemActive(child.path));
        }
        return false;
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-primary-foreground">
                                        <img
                                            src={LOGO_IMAGE}
                                            alt="logo"
                                            className="size-6 object-contain"
                                        />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {selectedTenant?.name ||
                                                'Select Tenant'}
                                        </span>
                                        <span className="truncate text-xs">
                                            Enterprise
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                align="start"
                                side="bottom"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Switch Tenant
                                </DropdownMenuLabel>
                                {tenants.map((tenant) => (
                                    <DropdownMenuItem
                                        key={tenant.id}
                                        onClick={() =>
                                            handleTenantChange(tenant.id)
                                        }
                                        className="gap-2 p-2"
                                    >
                                        <div className="flex size-6 items-center justify-center rounded-sm border">
                                            <Icons.Building className="size-4 shrink-0" />
                                        </div>
                                        {tenant.name}
                                        {tenant.id === selectedTenant?.id && (
                                            <Check className="ml-auto size-4" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 p-2">
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                        <Icons.Plus className="size-4" />
                                    </div>
                                    <div className="font-medium text-muted-foreground">
                                        Add tenant
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = isItemActive(item.path);
                        const isGroupExpanded = isGroupActive(item);
                        const hasChildren =
                            item.children && item.children.length > 0;

                        if (hasChildren) {
                            return (
                                <Collapsible
                                    key={item.label}
                                    asChild
                                    defaultOpen={isGroupExpanded}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={item.label}
                                                isActive={isActive}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.children?.map((child) => (
                                                    <SidebarMenuSubItem
                                                        key={child.label}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isItemActive(
                                                                child.path
                                                            )}
                                                        >
                                                            <Link
                                                                to={
                                                                    child.path ||
                                                                    '#'
                                                                }
                                                            >
                                                                {child.icon}
                                                                <span>
                                                                    {
                                                                        child.label
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        }

                        return (
                            <SidebarMenuItem key={item.label}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.label}
                                    isActive={isActive}
                                >
                                    <Link to={item.path || '#'}>
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user?.name || 'User'}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || 'user@example.com'}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">
                                                {user?.name || 'User'}
                                            </span>
                                            <span className="truncate text-xs">
                                                {user?.email ||
                                                    'user@example.com'}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Icons.Profile className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Icons.Billing className="mr-2 h-4 w-4" />
                                    Billing
                                </DropdownMenuItem>
                                <DropdownMenuItem>
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
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
