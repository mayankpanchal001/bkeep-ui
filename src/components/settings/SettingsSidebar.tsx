import { Link, useLocation } from 'react-router';

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
        icon?: React.ReactNode;
    }[];
}

export function SettingsSidebar({
    className,
    items,
    ...props
}: SettingsSidebarProps) {
    const location = useLocation();

    // Mobile: Tabs style (border-b container, horizontal scroll)
    // Desktop: Sidebar style (vertical, no border)
    const navClasses = `
        flex overflow-x-auto scrollbar-hide -mx-4 px-4 border-b border-gray-200
        lg:flex-col lg:space-x-0 lg:space-y-1 lg:border-0 lg:mx-0 lg:px-0 lg:overflow-visible
        ${className || ''}
    `;

    return (
        <nav className={navClasses} {...props}>
            <div className="flex space-x-6 min-w-max lg:flex-col lg:space-x-0 lg:space-y-1 lg:min-w-0 lg:w-full">
                {items.map((item) => {
                    const isActive =
                        location.pathname === item.href ||
                        location.pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`
                                flex items-center gap-2 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2
                                lg:px-3 lg:py-2 lg:rounded-md lg:border-0 lg:gap-3
                                ${
                                    isActive
                                        ? 'border-primary text-primary lg:bg-primary-5 lg:text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 lg:text-gray-600 lg:hover:bg-gray-50 lg:hover:text-gray-900'
                                }
                            `}
                        >
                            {item.icon && (
                                <span className="text-lg">{item.icon}</span>
                            )}
                            {item.title}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
