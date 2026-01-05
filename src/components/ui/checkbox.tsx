'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn';

function Checkbox({
    className,
    ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'size-4 shrink-0 rounded-2 border border-primary/10 bg-white text-transparent',
                'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white',
                'hover:border-primary/30 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/30',
                'disabled:cursor-not-allowed disabled:opacity-50 shadow-xs transition-shadow outline-none',
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="grid place-content-center text-current transition-none"
            >
                <CheckIcon className="size-3.5" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
