import { useThemePaletteSync } from '../../hooks/useThemePaletteSync';
import { useThemeSync } from '../../hooks/useThemeSync';
import { ThemeTransitionAnimation } from './ThemeTransitionAnimation';

/**
 * Provider component that syncs theme and theme palette changes
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    // Sync light/dark theme mode
    useThemeSync();

    // Sync theme palette colors
    useThemePaletteSync();

    return (
        <>
            {children}
            <ThemeTransitionAnimation />
        </>
    );
};
