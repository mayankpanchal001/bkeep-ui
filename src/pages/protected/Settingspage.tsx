import { PLURAL_TENANT_PREFIX } from '@/components/homepage/constants';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { SettingsSidebar } from '../../components/settings/SettingsSidebar';
import { Icons } from '../../components/shared/Icons';
import PageHeader from '../../components/shared/PageHeader';
import { useAuth } from '../../stores/auth/authSelectore';

const CAP_PLURAL =
    PLURAL_TENANT_PREFIX.charAt(0).toUpperCase() +
    PLURAL_TENANT_PREFIX.slice(1);

const Settingspage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Check if user is superadmin
    const isSuperAdmin = user?.role?.name === 'superadmin';

    // Redirect to profile if on base settings route
    useEffect(() => {
        if (location.pathname === '/settings') {
            navigate('/settings/profile', { replace: true });
        }
    }, [location.pathname, navigate]);

    const sidebarNavItems = [
        {
            title: 'Profile',
            href: '/settings/profile',
            icon: <Icons.Profile className="w-4 h-4" />,
        },
        ...(isSuperAdmin
            ? [
                  {
                      title: CAP_PLURAL,
                      href: '/settings/tenants',
                      icon: <Icons.Building className="w-4 h-4" />,
                  },
              ]
            : []),
        {
            title: 'Users',
            href: '/settings/users',
            icon: <Icons.Users className="w-4 h-4" />,
        },
        {
            title: 'Roles',
            href: '/settings/roles',
            icon: <Icons.Shield className="w-4 h-4" />,
        },
        {
            title: 'Security',
            href: '/settings/security',
            icon: <Icons.Lock className="w-4 h-4" />,
        },
        {
            title: 'Taxes',
            href: '/settings/taxes',
            icon: <Icons.Expenses className="w-4 h-4" />,
        },
        {
            title: 'Data & Privacy',
            href: '/settings/data',
            icon: <Icons.Database className="w-4 h-4" />,
        },
        {
            title: 'Notifications',
            href: '/settings/notifications',
            icon: <Icons.Notifications className="w-4 h-4" />,
        },
    ];

    // Dynamic header based on current route
    const currentItem =
        sidebarNavItems.find((item) =>
            location.pathname.startsWith(item.href)
        ) || null;

    const subtitleMap: Record<string, string> = {
        '/settings/profile': 'Manage your account settings',
        '/settings/tenants': `Manage ${PLURAL_TENANT_PREFIX}`,
        '/settings/users': 'Manage workspace users',
        '/settings/roles': 'Manage roles and permissions',
        '/settings/security': 'Authentication and MFA preferences',
        '/settings/taxes': 'Manage tax rates and status',
        '/settings/data': 'Personal data and privacy controls',
        '/settings/notifications': 'Notification preferences',
    };

    const headerTitle = currentItem?.title || 'Settings';
    const headerSubtitle =
        (currentItem && subtitleMap[currentItem.href]) ||
        'Manage your account settings';

    return (
        <div className="flex flex-col gap-4 w-full max-w-6xl lg:mx-auto">
            <PageHeader title={headerTitle} subtitle={headerSubtitle} />
            <div className="flex w-full flex-col gap-4 lg:flex-row min-h-0">
                <aside className="w-full lg:w-1/5 shrink-0 overflow-hidden">
                    <SettingsSidebar items={sidebarNavItems} />
                </aside>
                <div className="flex-1 min-w-0">
                    {/* <div className="bg-white rounded-md border border-primary/10 p-4 overflow-hidden"> */}
                    <div className="bg-white  px-4 overflow-hidden">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settingspage;
