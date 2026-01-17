import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';
// eslint-disable-next-line react-refresh/only-export-components
export const badgeVariants = cva(
    'inline-flex items-center justify-center uppercase rounded-full border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-foreground [a&]:hover:bg-primary/90 dark:bg-primary/70',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 dark:bg-secondary/70',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                success:
                    'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 [a&]:hover:bg-green-200 dark:[a&]:hover:bg-green-900/40',
                warning:
                    'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 [a&]:hover:bg-yellow-200 dark:[a&]:hover:bg-yellow-900/40',
                outline:
                    'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground dark:[a&]:hover:bg-accent/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export const Badge = ({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
};
