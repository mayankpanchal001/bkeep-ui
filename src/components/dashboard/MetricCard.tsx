import React from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

type MetricCardProps = {
    title: string;
    subtitle?: string;
    value: string;
    delta?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    children?: React.ReactNode;
};

export default function MetricCard({
    title,
    subtitle,
    value,
    delta,
    trend = 'neutral',
    icon,
    children,
}: MetricCardProps) {
    const trendColor =
        trend === 'up'
            ? 'text-green-600'
            : trend === 'down'
              ? 'text-red-600'
              : 'text-primary/50';

    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    {icon && <div className="text-primary">{icon}</div>}
                    <div>
                        <div className="text-xs font-medium text-primary/50">
                            {title}
                        </div>
                        {subtitle && (
                            <div className="text-xs text-primary/50">
                                {subtitle}
                            </div>
                        )}
                    </div>
                </div>
                <button className="text-xs text-primary/50 hover:text-primary">
                    Details
                </button>
            </div>
            <div className="mt-3 flex items-end justify-between">
                <div>
                    <div className="text-2xl font-bold text-primary">
                        {value}
                    </div>
                    {delta && (
                        <div
                            className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}
                        >
                            {trend === 'up' && (
                                <FaArrowUp className="w-3 h-3" />
                            )}
                            {trend === 'down' && (
                                <FaArrowDown className="w-3 h-3" />
                            )}
                            <span>{delta}</span>
                        </div>
                    )}
                </div>
                {children && <div className="ml-4">{children}</div>}
            </div>
        </div>
    );
}
