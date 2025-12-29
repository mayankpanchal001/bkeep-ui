import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { SettingsSidebar } from '../../components/settings/SettingsSidebar';
import { Icons } from '../../components/shared/Icons';
import { useAuth } from '../../stores/auth/authSelectore';

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
                      title: 'Tenants',
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

    return (
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
                <SettingsSidebar items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-2xl">
                <Outlet />
            </div>
        </div>
    );
};

export default Settingspage;
