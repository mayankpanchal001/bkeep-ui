import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../utils/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const buttonVariants = cva(
    "inline-flex capitalize  items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: 'bg-primary text-surface hover:bg-primary/90',
                outline:
                    'border border-primary/30 bg-surface shadow-xs hover:bg-primary/5 hover:text-primary dark:bg-surface-muted dark:border-primary/20 dark:hover:bg-primary/10',
                destructive:
                    'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',

                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10',
                link: 'text-primary underline-offset-4 hover:underline',
                active: 'bg-primary/10 text-primary border border-primary/10 hover:bg-primary/15 dark:bg-primary/20 dark:border-primary/20',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
                'icon-sm': 'size-8',
                'icon-lg': 'size-10',
            },
            isActive: {
                true: 'bg-primary/10 text-primary border border-primary/10',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            isActive: false,
        },
    }
);

function Button({
    className,
    variant = 'default',
    size = 'sm',
    asChild = false,
    tooltip,
    isActive = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        tooltip?: string | React.ComponentProps<typeof TooltipContent>;
        isActive?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    const button = (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(
                buttonVariants({ variant, size, className, isActive })
            )}
            {...props}
        />
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
