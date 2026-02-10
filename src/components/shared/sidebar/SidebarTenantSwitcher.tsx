import { SINGLE_TENANT_PREFIX } from '@/components/homepage/constants';
import { LOGO_IMAGE } from '@/constants/images';
import { useSwitchTenant, useUserTenants } from '@/services/apis/tenantApi';
import { useAuth } from '@/stores/auth/authSelectore';
import { useTenant } from '@/stores/tenant/tenantSelectore';
import { showErrorToast } from '@/utills/toast';
import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '../../ui/sidebar';

export function SidebarTenantSwitcher() {
    const { user, setAuth } = useAuth();
    const { selectedTenant, selectTenant } = useTenant();
    const { mutateAsync: switchTenant } = useSwitchTenant();
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

        // Find the full tenant object to persist it
        const targetTenant = tenants.find((t) => t.id === tenantId);
        if (!targetTenant) return;

        setIsSwitching(true);
        try {
            const response = await switchTenant(tenantId);
            // API Response structure: { success: true, data: { accessToken: "...", refreshToken: "..." } }
            // Since switchTenant returns SwitchTenantResponse directly (unwrapped from axios),
            // response IS the data object. So tokens are at response.data
            const responseData = response.data;

            if (user && responseData?.accessToken) {
                const updatedUser = { ...user, selectedTenantId: tenantId };

                // Explicitly update localStorage to ensure persistence before reload
                localStorage.setItem('accessToken', responseData.accessToken);
                // Only set refresh token if it exists and is not empty
                if (responseData.refreshToken) {
                    localStorage.setItem(
                        'refreshToken',
                        responseData.refreshToken
                    );
                }
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Persist tenant data for correct hydration after reload
                localStorage.setItem(
                    'selectedTenant',
                    JSON.stringify(targetTenant)
                );
                localStorage.setItem('tenants', JSON.stringify(tenants));

                // Update stores
                setAuth(
                    updatedUser,
                    responseData.accessToken,
                    responseData.refreshToken || ''
                );
                selectTenant(tenantId);

                // Reload to re-initialize app with new tenant context
                window.location.reload();
            }
        } catch (error) {
            console.error(`Failed to switch ${SINGLE_TENANT_PREFIX}:`, error);
            const maybeAxiosError = error as {
                response?: { data?: { message?: string } };
            };
            const message =
                maybeAxiosError.response?.data?.message ||
                `Failed to switch ${SINGLE_TENANT_PREFIX}. Please try again.`;
            showErrorToast(message);
        } finally {
            setIsSwitching(false);
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-primary-foreground">
                                <img
                                    src={LOGO_IMAGE}
                                    alt="logo"
                                    className="size-7 object-contain"
                                />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium text-sidebar-foreground">
                                    {selectedTenant?.name ||
                                        `Select ${
                                            SINGLE_TENANT_PREFIX.charAt(
                                                0
                                            ).toUpperCase() +
                                            SINGLE_TENANT_PREFIX.slice(1)
                                        }`}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-popover text-popover-foreground border-border"
                        align="start"
                        side="bottom"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            {`Switch ${
                                SINGLE_TENANT_PREFIX.charAt(0).toUpperCase() +
                                SINGLE_TENANT_PREFIX.slice(1)
                            }`}
                        </DropdownMenuLabel>
                        {tenants.map((tenant) => (
                            <DropdownMenuItem
                                key={tenant.id}
                                onClick={() => handleTenantChange(tenant.id)}
                                className="gap-2 p-2 focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                                    <GalleryVerticalEnd className="size-4 shrink-0" />
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
    );
}
