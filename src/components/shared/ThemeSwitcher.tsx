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
            className={`relative inline-flex h-8 w-14 items-center rounded-full border border-primary/25 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer ${
                isDark
                    ? 'bg-primary/25 hover:bg-primary/30'
                    : 'bg-primary/10 hover:bg-primary/15'
            }`}
        >
            <span
                className={`absolute left-1 top-[3px] flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm border border-primary/10 transition-transform duration-200 ease-out ${
                    isDark ? 'translate-x-6' : 'translate-x-0'
                }`}
            >
                {isDark ? (
                    <FaMoon className="h-3.5 w-3.5 text-primary" />
                ) : (
                    <FaSun className="h-3.5 w-3.5 text-yellow-500" />
                )}
            </span>
        </button>
    );
};

export const ThemeOnOffToggle = ThemeSwitcher;

export default ThemeSwitcher;
