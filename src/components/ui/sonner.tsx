import { useTheme as useAppTheme } from '@/stores/theme/themeSelectors';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const theme = useAppTheme();

    const toastOptions: ToasterProps['toastOptions'] = {
        ...props.toastOptions,
        style: {
            maxWidth: '380px',
            width: '100%',
            ...props.toastOptions?.style,
        },
    };

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            closeButton
            toastOptions={toastOptions}
            {...props}
        />
    );
};

export { Toaster };
