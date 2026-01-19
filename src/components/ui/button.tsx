import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-3 py-2 [&_svg]:size-3',
                sm: 'h-7 rounded-md px-3 text-xs [&_svg]:size-3.5',
                lg: 'h-10 rounded-md px-8 [&_svg]:size-5',
                icon: 'h-9 w-9 [&_svg]:size-4',
                'icon-sm': 'h-8 w-8 [&_svg]:size-3.5',
                'icon-lg': 'h-10 w-10 [&_svg]:size-5',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ComponentProps<'button'>,
        VariantProps<typeof buttonVariants> {
    /** Render as child component */
    asChild?: boolean;
    /** Icon to display before the button text */
    startIcon?: React.ReactNode;
    /** Icon to display after the button text */
    endIcon?: React.ReactNode;
    /** Show loading spinner and disable button */
    loading?: boolean;
    /** Text to show while loading (defaults to children) */
    loadingText?: string;
    /** Tooltip content */
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}

function Button({
    className,
    variant,
    size = 'sm',
    asChild = false,
    startIcon,
    endIcon,
    loading = false,
    loadingText,
    tooltip,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    // Determine if this is an icon-only button
    const isIconOnly =
        size === 'icon' || size === 'icon-sm' || size === 'icon-lg';

    const buttonContent = (
        <>
            {loading ? (
                <Loader2 className="animate-spin" />
            ) : startIcon ? (
                <span className="inline-flex shrink-0">{startIcon}</span>
            ) : null}
            {!isIconOnly && (
                <Slottable>
                    {loading && loadingText ? loadingText : children}
                </Slottable>
            )}
            {isIconOnly && !loading && <Slottable>{children}</Slottable>}
            {!loading && endIcon && (
                <span className="inline-flex shrink-0">{endIcon}</span>
            )}
        </>
    );

    const button = (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            disabled={isDisabled}
            {...props}
        >
            {buttonContent}
        </Comp>
    );

    if (!tooltip) {
        return button;
    }

    if (typeof tooltip === 'string') {
        tooltip = {
            children: tooltip,
        };
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent {...tooltip} />
        </Tooltip>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
