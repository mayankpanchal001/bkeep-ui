import { useEffect, useRef } from 'react';
import { useThemePaletteStore } from '../stores/theme/themePaletteStore';
import { useThemeStore } from '../stores/theme/themeStore';
import {
    applyThemePalette,
    getCurrentThemeMode,
} from '../utils/applyThemePalette';

/**
 * Hook to sync theme palette changes with CSS variables
 */
export const useThemePaletteSync = () => {
    const { selectedPaletteId, getPalette } = useThemePaletteStore();
    const { theme } = useThemeStore();
    const isInitialMount = useRef(true);

    useEffect(() => {
        const palette = getPalette();
        if (!palette) return;

        const isDark = getCurrentThemeMode();
        // Don't animate on initial mount, only on theme changes
        const shouldAnimate = !isInitialMount.current;
        applyThemePalette(palette, isDark, shouldAnimate);

        if (isInitialMount.current) {
            isInitialMount.current = false;
        }
    }, [selectedPaletteId, theme, getPalette]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const palette = getPalette();
            if (!palette) return;
            const isDark = mediaQuery.matches;
            // Animate system theme changes
            applyThemePalette(palette, isDark, true);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, getPalette]);
};
