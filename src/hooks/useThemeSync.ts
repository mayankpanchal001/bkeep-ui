import { useEffect } from 'react';
import { useTheme } from '../stores/theme/themeSelectors';

export const useThemeSync = () => {
    const theme = useTheme();

    useEffect(() => {
        const root = document.documentElement;

        // 1. Determine if we should use Dark Mode
        const isDark =
            theme === 'dark' ||
            (theme === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        // 2. Apply or remove the 'dark' class
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);
};
