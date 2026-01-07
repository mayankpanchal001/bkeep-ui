import { useTheme as useAppTheme } from '@/stores/theme/themeSelectors';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const theme = useAppTheme();

    return <Sonner theme={theme as ToasterProps['theme']} {...props} />;
};

export { Toaster };
