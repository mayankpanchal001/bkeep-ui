import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

type TabItem = {
    id: string;
    label: string;
    icon?: ReactNode;
};

type TabNavProps = {
    items: TabItem[];
    value?: string;
    onChange?: (id: string) => void;
    className?: string;
};

export default function TabNav({
    items,
    value,
    onChange,
    className,
}: TabNavProps) {
    const [internal, setInternal] = useState(items[0]?.id);
    const current = value ?? internal;

    const handleSelect = (id: string) => {
        if (!value) setInternal(id);
        onChange?.(id);
    };

    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-md bg-primary/5 p-1',
                className
            )}
        >
            {items.map((item) => {
                const active = current === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm transition-colors cursor-pointer',
                            active
                                ? 'bg-card text-primary  border border-primary/10'
                                : 'text-primary/50 hover:bg-primary/10'
                        )}
                    >
                        {item.icon && (
                            <span className="text-sm">{item.icon}</span>
                        )}
                        <span
                            className={`text-sm  ${cn(
                                active
                                    ? 'font-medium'
                                    : 'max-sm:hidden font-normal'
                            )}`}
                        >
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
