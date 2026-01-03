import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
    'inline-flex gap-2 uppercase items-center justify-center font-normal tracking-wider transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    {
        variants: {
            variant: {
                primary: 'bg-primary hover:bg-primary/90 text-white',
                outline:
                    'bg-white text-primary shadow-sm shadow-primary/20 hover:bg-primary hover:text-white active:bg-primary',
                ghost: 'hover:bg-primary/10 text-primary',
            },
            size: {
                sm: 'h-7 px-3 text-[10px]',
                md: 'h-10 px-4 py-1 text-sm',
                lg: 'h-12 px-6 py-2 text-base',
            },
            isRounded: {
                true: 'rounded-full',
                false: 'rounded-sm',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'sm',
            isRounded: false,
        },
    }
);
