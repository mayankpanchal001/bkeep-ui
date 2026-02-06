import { useThemeSync } from '../../hooks/useThemeSync';

export const ThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    useThemeSync();
    return <>{children}</>;
};
