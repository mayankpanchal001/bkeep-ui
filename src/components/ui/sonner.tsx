import { useTheme as useAppTheme } from '@/stores/theme/themeSelectors';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

// Custom close button component
const CustomCloseButton = ({ closeToast }: { closeToast: () => void }) => {
    return (
        <button
            type="button"
            onClick={closeToast}
            aria-label="Close notification"
            className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                'text-muted-foreground/40 transition-all duration-200',
                'hover:bg-muted/70 hover:text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                'active:scale-95'
            )}
        >
            <X className="h-3.5 w-3.5 transition-transform duration-200 hover:rotate-90" />
        </button>
    );
};

const Toaster = ({ ...props }: ToasterProps) => {
    const theme = useAppTheme();

    const toastOptions: ToasterProps['toastOptions'] = {
        ...props.toastOptions,
        style: {
            maxWidth: '420px',
            width: '100%',
            ...props.toastOptions?.style,
        },
        className: cn(
            'group relative flex items-start gap-3 rounded-lg border border-border bg-card text-card-foreground',
            'shadow-lg shadow-black/10 dark:shadow-black/30 backdrop-blur-sm',
            'px-4 py-3',
            'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
            'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
            'data-[swipe=move]:transition-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[swipe=end]:animate-out data-[state=closed]:fade-out-80',
            'data-[state=closed]:slide-out-to-right-full',
            'data-[state=open]:slide-in-from-top-full data-[state=open]:fade-in-0',
            'data-[state=open]:zoom-in-95',
            'data-[state=closed]:zoom-out-95',
            '[&>div]:flex-1 [&>div]:min-w-0',
            props.toastOptions?.className
        ),
    };

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}

            closeButton={
                ((props: { closeToast: () => void }) => (
                    <CustomCloseButton {...props} />
                )) as unknown as boolean | undefined
            }
            toastOptions={toastOptions}
            className="toaster group [&>li]:list-none"
            position={props.position || 'top-center'}
            gap={10}
            richColors
            expand={true}
            visibleToasts={5}
            {...props}
        />
    );
};

export { Toaster };
