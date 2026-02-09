import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '../ui/sidebar';
import { SidebarNavMain } from './sidebar/SidebarNavMain';
import { SidebarTenantSwitcher } from './sidebar/SidebarTenantSwitcher';
import { SidebarUserMenu } from './sidebar/SidebarUserMenu';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="bg-sidebar">
                <SidebarTenantSwitcher />
            </SidebarHeader>
            <SidebarContent className="bg-sidebar">
                <SidebarNavMain />
            </SidebarContent>
            <SidebarFooter className="bg-sidebar">
                <SidebarUserMenu />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
