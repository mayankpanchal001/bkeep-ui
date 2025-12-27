import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { SIDEBAR_ITEMS } from '../../constants';

const FloatingDock = () => {
    const location = useLocation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const isItemActive = (itemPath: string | undefined) => {
        if (!itemPath) return false;
        if (location.pathname === itemPath) return true;
        if (location.pathname.startsWith(itemPath + '/')) return true;
        return false;
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-end gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-primary-10 rounded-2xl shadow-2xl transition-all duration-300">
                {SIDEBAR_ITEMS.map((item, index) => {
                    const isActive = isItemActive(item.path);
                    const isHovered = hoveredIndex === index;

                    // Simple scale effect for the "dock" feeling
                    // Neighboring items could also scale slightly if we wanted full macOS style
                    // For now, let's just scale the hovered item

                    return (
                        <div
                            key={item.label}
                            className="relative group flex flex-col items-center justify-end"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Tooltip */}
                            <div
                                className={`
                                absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1
                                bg-primary text-white text-xs rounded opacity-0 group-hover:opacity-100
                                transition-opacity whitespace-nowrap pointer-events-none shadow-lg
                                mb-2
                            `}
                            >
                                {item.label}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                            </div>

                            <Link
                                to={item.path || '/dashboard'}
                                className={`
                                    flex items-center justify-center
                                    w-12 h-12 rounded-xl text-xl
                                    transition-all duration-200 ease-out
                                    ${
                                        isActive
                                            ? 'bg-primary text-white shadow-lg scale-110 -translate-y-2'
                                            : 'text-primary-50 hover:bg-primary-5 hover:text-primary hover:-translate-y-2'
                                    }
                                    ${isHovered && !isActive ? 'scale-110' : ''}
                                `}
                            >
                                {item.icon}
                            </Link>

                            {/* Active Dot Indicator */}
                            {isActive && (
                                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FloatingDock;
