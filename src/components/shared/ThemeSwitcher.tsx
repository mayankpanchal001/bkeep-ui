import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme, useThemeActions } from '../../stores/theme/themeSelectors';

const ThemeSwitcher = () => {
    const theme = useTheme();
    const { setTheme } = useThemeActions();

    const systemPrefersDark =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark =
        theme === 'dark' || (theme === 'system' && systemPrefersDark);

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            role="switch"
            aria-checked={isDark}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-primary/25 text-primary shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:border-primary/20 cursor-pointer`}
        >
            {isDark ? (
                <FaMoon className="h-3.5 w-3.5 text-primary" />
            ) : (
                <FaSun className="h-3.5 w-3.5 text-yellow-500" />
            )}
        </button>
    );
};

export const ThemeOnOffToggle = ThemeSwitcher;

export default ThemeSwitcher;
