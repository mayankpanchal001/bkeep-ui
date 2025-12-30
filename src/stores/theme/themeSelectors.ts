import { useThemeStore } from './themeStore';

/**
 * Hook to access the current theme value.
 * Using a selector ensures we only re-render when 'theme' changes.
 */
export const useTheme = () => useThemeStore((state) => state.theme);

/**
 * Hook to access theme actions.
 * These actions are stable and won't cause re-renders.
 */
export const useThemeActions = () => ({
    setTheme: useThemeStore((state) => state.setTheme),
});
