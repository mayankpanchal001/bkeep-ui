import { SIDEBAR_ITEMS } from '@/constants';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '../../ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '../../ui/sidebar';

export function SidebarNavMain() {
    const location = useLocation();
    const { isMobile, setOpenMobile } = useSidebar();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Favourite reports logic
    const LS_FAV_KEY = 'bkeep-report-favourites';
    const LS_FAV_LABEL_KEY = 'bkeep-report-favourites-labels';
    type FavLink = { label: string; path: string };
    const [favLinks, setFavLinks] = useState<FavLink[]>([]);

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
        <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground uppercase tracking-wider text-xs font-medium px-2 mb-2">
                Platform
            </SidebarGroupLabel>
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

                        const hasChildren =
                            baseChildren && baseChildren.length > 0;
                        const isGroupExpanded =
                            isGroupActive({
                                ...item,
                                children: baseChildren,
                            } as typeof item) ||
                            (isReports &&
                                baseChildren.some((c) => isItemActive(c.path)));

                        if (hasChildren) {
                            const isHovered = hoveredItem === item.label;
                            // Only auto-expand on hover if sidebar is collapsed (icon mode) - strictly typically sidebar behavior
                            // But here let's stick to simple active state or hover
                            const isOpen = isGroupExpanded || isHovered;

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
                                    onOpenChange={(open) => {
                                        if (open) setHoveredItem(item.label);
                                        else setHoveredItem(null);
                                    }}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <div className="flex items-center">
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.label}
                                                isActive={isActive}
                                                className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors duration-200"
                                            >
                                                <Link
                                                    to={item.path || '#'}
                                                    onClick={() => {
                                                        if (isMobile)
                                                            setOpenMobile(
                                                                false
                                                            );
                                                    }}
                                                >
                                                    {item.icon}
                                                    <span className="font-medium">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuAction
                                                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:rotate-90 transition-transform duration-200"
                                                    showOnHover
                                                    onMouseEnter={
                                                        handleMouseEnter
                                                    }
                                                    onMouseLeave={
                                                        handleMouseLeave
                                                    }
                                                >
                                                    <ChevronRight className="size-4" />
                                                </SidebarMenuAction>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {baseChildren.map((child) => (
                                                    <SidebarMenuSubItem
                                                        key={child.label}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={
                                                                child.path ===
                                                                item.path
                                                                    ? location.pathname ===
                                                                      child.path
                                                                    : isItemActive(
                                                                          child.path
                                                                      )
                                                            }
                                                            className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors duration-200"
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
                                                                {'icon' in
                                                                    child &&
                                                                    child.icon && (
                                                                        <span className="mr-2 [&>svg]:size-4">
                                                                            {
                                                                                child.icon
                                                                            }
                                                                        </span>
                                                                    )}
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
                                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors duration-200"
                                >
                                    <Link
                                        to={item.path || '#'}
                                        onClick={() => {
                                            if (isMobile) setOpenMobile(false);
                                        }}
                                    >
                                        {item.icon}
                                        <span className="font-medium">
                                            {item.label}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
