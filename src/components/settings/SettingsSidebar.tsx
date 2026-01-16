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
         flex overflow-x-auto scrollbar-hide -mx-4 px-4 border-b border-primary/10
        lg:flex-col lg:space-x-0 lg:space-y-1 lg:border-0 lg:mx-0 lg:px-0 lg:overflow-visible
        ${className || ''}
    `;

    return (
        <nav className={navClasses} {...props}>
            <div className="flex gap-4 sm:gap-0.5 sm:flex-col lg:bg-card lg:border lg:border-primary/10 lg:rounded-md lg:p-2">
                {items.map((item) => {
                    const isActive =
                        location.pathname === item.href ||
                        location.pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`
                                flex items-center gap-2 p-1 sm:p-2 text-xs font-normal transition-colors whitespace-nowrap border-b-2
                                rounded-sm lg:border-0
                                ${
                                    isActive
                                        ? 'border-primary text-primary lg:bg-primary/5 lg:text-primary'
                                        : 'border-transparent text-primary/50 hover:text-primary/70 hover:border-primary/25 lg:text-primary/60 lg:hover:bg-card lg:hover:text-primary'
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
