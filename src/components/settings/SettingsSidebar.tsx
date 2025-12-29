import { Link, useLocation } from 'react-router';

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
        icon?: React.ReactNode;
    }[];
}

export function SettingsSidebar({ className, items, ...props }: SettingsSidebarProps) {
    const location = useLocation();
    
    // Simple class merger
    const classes = `flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 ${className || ''}`;

    return (
        <nav className={classes} {...props}>
            {items.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`
                            flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                            ${isActive 
                                ? "bg-primary-5 text-primary" 
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                        `}
                    >
                        {item.icon && <span className="text-lg">{item.icon}</span>}
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
