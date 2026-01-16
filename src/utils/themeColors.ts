/**
 * Utility function to get CSS variable values for use in inline styles
 * This is particularly useful for Recharts components that require color values
 */
export const getThemeColor = (varName: string): string => {
    if (typeof window === 'undefined') {
        // SSR fallback - return default light mode values
        const defaults: Record<string, string> = {
            '--color-surface': '#ffffff',
            '--color-surface-muted': '#f6f7fb',
            '--color-primary': '#1c1c1c',
            '--color-secondary': '#5e17eb',
            '--color-accent': '#c55a11',
            '--color-background': '#ffffff',
            '--color-foreground': '#1c1c1c',
            '--color-card': '#ffffff',
            '--color-card-foreground': '#1c1c1c',
            '--color-border': 'rgba(28, 28, 28, 0.1)',
            '--color-destructive': '#c55a11',
        };
        return defaults[varName] || '#000000';
    }
    return (
        getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim() || '#000000'
    );
};

/**
 * Get theme colors as an object for easier access
 */
export const getThemeColors = () => ({
    surface: getThemeColor('--color-surface'),
    surfaceMuted: getThemeColor('--color-surface-muted'),
    primary: getThemeColor('--color-primary'),
    secondary: getThemeColor('--color-secondary'),
    accent: getThemeColor('--color-accent'),
    background: getThemeColor('--color-background'),
    foreground: getThemeColor('--color-foreground'),
    card: getThemeColor('--color-card'),
    cardForeground: getThemeColor('--color-card-foreground'),
    border: getThemeColor('--color-border'),
    destructive: getThemeColor('--color-destructive'),
});
