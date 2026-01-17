import { ThemePalette } from '../stores/theme/themePaletteStore';
import { useThemeStore } from '../stores/theme/themeStore';

/**
 * Apply theme palette CSS variables to the document root
 * @param palette - The theme palette to apply
 * @param isDark - Whether to use dark mode variant
 * @param animated - Whether to animate the transition (default: true)
 */
export const applyThemePalette = (
    palette: ThemePalette,
    isDark: boolean,
    animated: boolean = true
) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const theme = isDark ? palette.dark : palette.light;

    // Enable transitions if animated
    if (animated) {
        root.style.setProperty(
            '--theme-transition',
            'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        );
        document.body.classList.add('theme-transitioning');
    }

    // Apply all color variables
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--card-foreground', theme.cardForeground);
    root.style.setProperty('--popover', theme.popover);
    root.style.setProperty('--popover-foreground', theme.popoverForeground);
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-foreground', theme.primaryForeground);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--secondary-foreground', theme.secondaryForeground);
    root.style.setProperty('--muted', theme.muted);
    root.style.setProperty('--muted-foreground', theme.mutedForeground);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-foreground', theme.accentForeground);
    root.style.setProperty('--destructive', theme.destructive);
    root.style.setProperty('--destructive-foreground', theme.destructiveForeground);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--input', theme.input);
    root.style.setProperty('--ring', theme.ring);

    // Apply sidebar colors based on theme
    // Sidebar background uses card color
    root.style.setProperty('--sidebar', theme.card);
    root.style.setProperty('--sidebar-foreground', theme.foreground);
    // Sidebar accent uses muted color for hover states (subtle background)
    root.style.setProperty('--sidebar-accent', theme.muted);
    root.style.setProperty('--sidebar-accent-foreground', theme.primary);
    // Sidebar primary uses primary color for active states
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-primary-foreground', theme.primaryForeground);
    // Sidebar border uses border color
    root.style.setProperty('--sidebar-border', theme.border);
    // Sidebar ring uses ring color
    root.style.setProperty('--sidebar-ring', theme.ring);

    // Remove transition class after animation completes
    if (animated) {
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
            root.style.removeProperty('--theme-transition');
        }, 600);
    }
};

/**
 * Get current theme mode (light/dark) based on theme store and system preference
 */
export const getCurrentThemeMode = (): boolean => {
    if (typeof window === 'undefined') return false;

    const themeStore = useThemeStore.getState();
    const theme = themeStore.theme;

    if (theme === 'dark') return true;
    if (theme === 'light') return false;

    // System preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
