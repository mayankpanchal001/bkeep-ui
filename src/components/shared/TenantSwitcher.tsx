import { Building, Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useSwitchTenant, useUserTenants } from '../../services/apis/tenantApi';
import { useAuth } from '../../stores/auth/authSelectore';
import { useTenant } from '../../stores/tenant/tenantSelectore';
import { showErrorToast } from '../../utills/toast';
import { cn } from '../../utils/cn';

import { SINGLE_TENANT_PREFIX } from '@/components/homepage/constants';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const CAP_SINGULAR =
    SINGLE_TENANT_PREFIX.charAt(0).toUpperCase() +
    SINGLE_TENANT_PREFIX.slice(1);

type TenantSwitcherProps = {
    compact?: boolean;
};

const TenantSwitcher = ({ compact = false }: TenantSwitcherProps) => {
    const { user, setAuth } = useAuth();
    const [isSwitching, setIsSwitching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { mutateAsync: switchTenant } = useSwitchTenant();
    const { selectTenant } = useTenant();

    // Fetch user-accessible tenants from API (works for all users)
    const { data: tenantsResponse, isLoading: isLoadingTenants } =
        useUserTenants({
            page: 1,
            limit: 100,
            sort: 'createdAt',
            order: 'asc',
        });

    const tenants = tenantsResponse?.data?.items || [];
    const selectedTenantId = user?.selectedTenantId;
    const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

    const handleTenantChange = async (tenantId: string) => {
        if (!tenantId || tenantId === selectedTenantId) {
            setIsOpen(false);
            return;
        }

        setIsSwitching(true);
        setIsOpen(false);
        try {
            console.log('Initiating tenant switch to:', tenantId);

            // Call the switch API
            const response = await switchTenant(tenantId);

            console.log('Tenant switch response:', response);

            // Update auth tokens with the new ones from the response
            if (
                user &&
                response.data.accessToken &&
                response.data.refreshToken
            ) {
                // Update the user's selectedTenantId
                const updatedUser = {
                    ...user,
                    selectedTenantId: tenantId,
                };

                // Update auth store with new tokens and updated user
                setAuth(
                    updatedUser,
                    response.data.accessToken,
                    response.data.refreshToken
                );

                console.log('Auth tokens and user updated successfully');
            }

            // Update tenant store selection immediately
            selectTenant(tenantId);

            // Reload the page to ensure all data is refreshed with new tenant context
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

    const buttonClasses = compact ? 'h-7 px-2 text-[10px]' : 'h-8 px-1 text-xs';

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    disabled={isSwitching || isLoadingTenants}
                    aria-label={`${CAP_SINGULAR} switcher`}
                    aria-expanded={isOpen}
                    className={cn(
                        'group pl-1 inline-flex items-center gap-2 rounded-full bg-card border border-primary/25 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card cursor-pointer',
                        buttonClasses,
                        (isSwitching || isLoadingTenants) &&
                            'opacity-60 cursor-not-allowed',
                        !isSwitching &&
                            !isLoadingTenants &&
                            'hover:border-primary/20',
                        isOpen && 'ring-1 ring-primary/25'
                    )}
                >
                    <span
                        className={cn(
                            'shrink-0 flex items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary',
                            compact ? 'w-5 h-5' : 'w-6 h-6'
                        )}
                    >
                        <Building className="w-3.5 h-3.5" />
                    </span>
                    <span
                        className={cn(
                            'text-primary font-medium truncate',
                            compact ? 'max-w-[120px]' : 'max-w-[160px]'
                        )}
                    >
                        {isLoadingTenants
                            ? 'Loading...'
                            : selectedTenant?.name || `Select ${CAP_SINGULAR}`}
                    </span>
                    <ChevronsUpDown
                        className={cn(
                            'text-primary/50 w-3 h-3 transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
                <Command>
                    <CommandInput placeholder={`Search ${CAP_SINGULAR}...`} />
                    <CommandList>
                        <CommandEmpty>{`No ${SINGLE_TENANT_PREFIX} found.`}</CommandEmpty>
                        <CommandGroup heading={`Switch ${CAP_SINGULAR}`}>
                            {tenants.map((tenant) => (
                                <CommandItem
                                    key={tenant.id}
                                    value={tenant.name}
                                    onSelect={() =>
                                        handleTenantChange(tenant.id)
                                    }
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary">
                                            <Building className="h-3 w-3" />
                                        </div>
                                        <span className="truncate">
                                            {tenant.name}
                                        </span>
                                    </div>
                                    <Check
                                        className={cn(
                                            'ml-auto h-4 w-4',
                                            tenant.id === selectedTenantId
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default TenantSwitcher;
