import { useThemeStore } from './themeStore';

export const useTheme = () => useThemeStore((state) => state.theme);

export const useThemeActions = () => ({
    setTheme: useThemeStore((state) => state.setTheme),
    theme: useThemeStore((state) => state.theme),
});
