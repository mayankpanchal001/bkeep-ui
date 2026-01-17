/**
 * Utility function to get CSS variable values for use in inline styles
 * This is particularly useful for Recharts components that require color values
 */
export const getThemeColor = (varName: string): string => {
    if (typeof window === 'undefined') {
        // SSR fallback - return default light mode values based on theme.css
        const defaults: Record<string, string> = {
            '--color-background': 'oklch(0.9824 0.0013 286.3757)',
            '--color-foreground': 'oklch(0.3211 0 0)',
            '--color-card': 'oklch(1.0000 0 0)',
            '--color-card-foreground': 'oklch(0.3211 0 0)',
            '--color-primary': 'oklch(0.6487 0.1538 150.3071)',
            '--color-primary-foreground': 'oklch(1.0000 0 0)',
            '--color-secondary': 'oklch(0.6746 0.1414 261.3380)',
            '--color-secondary-foreground': 'oklch(1.0000 0 0)',
            '--color-muted': 'oklch(0.8828 0.0285 98.1033)',
            '--color-muted-foreground': 'oklch(0.5382 0 0)',
            '--color-accent': 'oklch(0.8269 0.1080 211.9627)',
            '--color-accent-foreground': 'oklch(0.3211 0 0)',
            '--color-destructive': 'oklch(0.6368 0.2078 25.3313)',
            '--color-destructive-foreground': 'oklch(1.0000 0 0)',
            '--color-border': 'oklch(0.8699 0 0)',
            '--color-input': 'oklch(0.8699 0 0)',
            '--color-ring': 'oklch(0.6487 0.1538 150.3071)',
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
    background: getThemeColor('--color-background'),
    foreground: getThemeColor('--color-foreground'),
    card: getThemeColor('--color-card'),
    cardForeground: getThemeColor('--color-card-foreground'),
    primary: getThemeColor('--color-primary'),
    primaryForeground: getThemeColor('--color-primary-foreground'),
    secondary: getThemeColor('--color-secondary'),
    secondaryForeground: getThemeColor('--color-secondary-foreground'),
    muted: getThemeColor('--color-muted'),
    mutedForeground: getThemeColor('--color-muted-foreground'),
    accent: getThemeColor('--color-accent'),
    accentForeground: getThemeColor('--color-accent-foreground'),
    destructive: getThemeColor('--color-destructive'),
    destructiveForeground: getThemeColor('--color-destructive-foreground'),
    border: getThemeColor('--color-border'),
    input: getThemeColor('--color-input'),
    ring: getThemeColor('--color-ring'),
    // Legacy aliases for backward compatibility
    surface: getThemeColor('--color-card'),
    surfaceMuted: getThemeColor('--color-muted'),
});
