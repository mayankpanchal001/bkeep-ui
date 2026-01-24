import { SINGLE_TENANT_PREFIX } from '@/components/homepage/constants';
import { Check, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { SIDEBAR_ITEMS } from '../../constants';
import { LOGO_IMAGE } from '../../constants/images';
import { useLogout } from '../../services/apis/authApi';
import { useSwitchTenant, useUserTenants } from '../../services/apis/tenantApi';
import { useAuth } from '../../stores/auth/authSelectore';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import { showErrorToast } from '../../utills/toast';
import { Icons } from '../shared/Icons';
import { Avatar, AvatarFallback } from '../ui/avatar';
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
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from '../ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const location = useLocation();
    const { user, setAuth } = useAuth();
    const { mutateAsync: logout } = useLogout();
    const { selectedTenant, selectTenant } = useTenant();
    const { mutateAsync: switchTenant } = useSwitchTenant();

    // Tenant Switcher Logic
    const [, setIsSwitching] = useState(false);
    const { data: tenantsResponse } = useUserTenants({
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
            console.error(`Failed to switch ${SINGLE_TENANT_PREFIX}:`, error);
            showErrorToast(
                `Failed to switch ${SINGLE_TENANT_PREFIX}. Please try again.`
            );
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

    // Favourite reports in sidebar under Reports
    const LS_FAV_KEY = 'bkeep-report-favourites';
    const LS_FAV_LABEL_KEY = 'bkeep-report-favourites-labels';
    type FavLink = { label: string; path: string };
    const [favLinks, setFavLinks] = useState<FavLink[]>([]);
    const [query, setQuery] = useState('');
    const { isMobile, setOpenMobile } = useSidebar();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        const read = (): FavLink[] => {
            try {
                const raw = localStorage.getItem(LS_FAV_KEY);
                const favs: string[] = raw ? JSON.parse(raw) : [];
                const rawLabels = localStorage.getItem(LS_FAV_LABEL_KEY);
                const labels: Record<string, string> = rawLabels
                    ? JSON.parse(rawLabels)
                    : {};
                if (!Array.isArray(favs)) return [];
                const toTitle = (s: string) =>
                    s
                        .split('-')
                        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                        .join(' ');
                const links: FavLink[] = favs.map((id) => {
                    const [category, report] = id.split(':');
                    const label = labels[id] || toTitle(report || id);
                    const path = `/reports/${category}/${report}`;
                    return { label, path };
                });
                return links;
            } catch {
                return [];
            }
        };
        setFavLinks(read());
        const onStorage = (e: StorageEvent) => {
            if (e.key === LS_FAV_KEY || e.key === LS_FAV_LABEL_KEY) {
                setFavLinks(read());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('storage', onStorage);
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="mb-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-primary">
                                        <img
                                            src={LOGO_IMAGE}
                                            alt="logo"
                                            className="size-6 object-contain"
                                        />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {selectedTenant?.name ||
                                                `Select ${SINGLE_TENANT_PREFIX.charAt(
                                                    0
                                                ).toUpperCase() +
                                                SINGLE_TENANT_PREFIX.slice(
                                                    1
                                                )
                                                }`}
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
                                    {`Switch ${SINGLE_TENANT_PREFIX.charAt(
                                        0
                                    ).toUpperCase() +
                                        SINGLE_TENANT_PREFIX.slice(1)
                                        }`}
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
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarInput
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="group-data-[collapsible=icon]:hidden"
                />
            </SidebarHeader>
            <SidebarContent>
                {favLinks.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Favourites</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {favLinks.map((fav) => (
                                    <SidebarMenuItem key={fav.path}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={fav.label}
                                        >
                                            <Link
                                                to={fav.path}
                                                onClick={() => {
                                                    if (isMobile)
                                                        setOpenMobile(false);
                                                }}
                                            >
                                                <Icons.Star className="size-4 text-yellow-500" />
                                                <span>{fav.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                {favLinks.length > 0 && <SidebarSeparator />}
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SIDEBAR_ITEMS.map((item) => {
                                const isActive = isItemActive(item.path);
                                const isReports = item.path === '/reports';
                                const baseChildren = isReports
                                    ? [
                                        ...favLinks.map((f) => ({
                                            label: f.label,
                                            path: f.path,
                                        })),
                                        ...(item.children || []),
                                    ]
                                    : item.children || [];
                                const q = query.trim().toLowerCase();
                                const itemMatches =
                                    q.length > 0
                                        ? item.label.toLowerCase().includes(q)
                                        : true;
                                const computedChildren =
                                    q.length > 0
                                        ? (baseChildren || []).filter((c) =>
                                            (c.label || '')
                                                .toLowerCase()
                                                .includes(q)
                                        )
                                        : baseChildren || [];
                                const shouldRender =
                                    itemMatches ||
                                    (computedChildren &&
                                        computedChildren.length > 0);
                                const isGroupExpanded =
                                    isGroupActive({
                                        ...item,
                                        children: computedChildren,
                                    } as (typeof SIDEBAR_ITEMS)[0]) ||
                                    (isReports &&
                                        computedChildren.some((c) =>
                                            isItemActive(c.path || '')
                                        ));
                                const hasChildren =
                                    computedChildren &&
                                    computedChildren.length > 0;

                                if (!shouldRender) {
                                    return null;
                                }

                                if (hasChildren) {
                                    const isHovered = hoveredItem === item.label;
                                    const isOpen =
                                        q.length > 0
                                            ? true
                                            : isGroupExpanded || isHovered;

                                    const handleMouseEnter = () => {
                                        if (hoverTimeoutRef.current) {
                                            clearTimeout(hoverTimeoutRef.current);
                                            hoverTimeoutRef.current = null;
                                        }
                                        setHoveredItem(item.label);
                                    };

                                    const handleMouseLeave = () => {
                                        hoverTimeoutRef.current = setTimeout(() => {
                                            setHoveredItem(null);
                                        }, 150);
                                    };

                                    return (
                                        <Collapsible
                                            key={item.label}
                                            asChild
                                            open={isOpen}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem className="transition-all duration-200 ease-in-out">
                                                <div className="flex items-center">
                                                    <SidebarMenuButton
                                                        asChild
                                                        tooltip={item.label}
                                                        isActive={isActive}
                                                        className="transition-all duration-200 ease-in-out"
                                                    >
                                                        <Link
                                                            to={
                                                                item.path || '#'
                                                            }
                                                            onClick={() => {
                                                                if (isMobile)
                                                                    setOpenMobile(
                                                                        false
                                                                    );
                                                            }}
                                                        >
                                                            {item.icon}
                                                            <span>
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuAction
                                                            showOnHover
                                                            onMouseEnter={handleMouseEnter}
                                                            onMouseLeave={handleMouseLeave}
                                                        >
                                                            <ChevronRight className="transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuAction>
                                                    </CollapsibleTrigger>
                                                </div>
                                                <CollapsibleContent
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    className="transition-all duration-300 ease-in-out"
                                                >
                                                    <SidebarMenuSub className="transition-all duration-300 ease-in-out">
                                                        {computedChildren.map(
                                                            (child) => (
                                                                <SidebarMenuSubItem
                                                                    key={
                                                                        child.label
                                                                    }
                                                                    className="transition-all duration-200 ease-in-out"
                                                                >
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        isActive={isItemActive(
                                                                            child.path
                                                                        )}
                                                                        className="transition-all duration-200 ease-in-out"
                                                                    >
                                                                        <Link
                                                                            to={
                                                                                child.path ||
                                                                                '#'
                                                                            }
                                                                            onClick={() => {
                                                                                if (
                                                                                    isMobile
                                                                                )
                                                                                    setOpenMobile(
                                                                                        false
                                                                                    );
                                                                            }}
                                                                        >
                                                                            {'icon' in child && child.icon && (
                                                                                <span className="[&>svg]:text-sidebar-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-200">
                                                                                    {child.icon}
                                                                                </span>
                                                                            )}
                                                                            <span>
                                                                                {child.label}
                                                                            </span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            )
                                                        )}
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
                                            <Link
                                                to={item.path || '#'}
                                                onClick={() => {
                                                    if (isMobile)
                                                        setOpenMobile(false);
                                                }}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarSeparator className="mb-2" />
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="size-9">
                                        <AvatarFallback >
                                            {user?.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
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
                                        <Avatar className="size-9">
                                            <AvatarFallback>
                                                {user?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>

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
                                    <Link
                                        to="/settings/profile"
                                        className="w-full flex gap-1"
                                        onClick={() => {
                                            if (isMobile) setOpenMobile(false);
                                        }}
                                    >
                                        <Icons.Profile className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                    <Link
                                        to="/settings/notifications"
                                        className="w-full flex gap-1"
                                        onClick={() => {
                                            if (isMobile) setOpenMobile(false);
                                        }}
                                    >
                                        <Icons.Notifications className="mr-2 h-4 w-4" />
                                        Notifications
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
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
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
