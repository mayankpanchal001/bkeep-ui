import { cn } from '@/utils/cn';
import * as React from 'react';

type InputProps = React.ComponentProps<'input'> & {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
};

export default function Input({
    className,
    type,
    startIcon,
    endIcon,
    ...props
}: InputProps) {
    const withAdornment = !!startIcon || !!endIcon;
    const baseClasses = cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
    );

    if (!withAdornment) {
        return (
            <input
                type={type}
                data-slot="input"
                className={baseClasses}
                {...props}
            />
        );
    }

    return (
        <div className="relative w-full">
            {startIcon ? (
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center">
                    {startIcon}
                </span>
            ) : null}
            <input
                type={type}
                data-slot="input"
                className={cn(
                    baseClasses,
                    startIcon && 'pl-9',
                    endIcon && 'pr-9'
                )}
                {...props}
            />
            {endIcon ? (
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center">
                    {endIcon}
                </span>
            ) : null}
        </div>
    );
}
