import { Moon, Sun } from 'lucide-react';
import { useTheme, useThemeActions } from '../../stores/theme/themeSelectors';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    role="switch"
                    aria-checked={isDark}
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-card border border-primary/25 text-primary shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card hover:border-primary/20 cursor-pointer`}
                >
                    {isDark ? (
                        <Moon className="h-3.5 w-3.5 text-primary" />
                    ) : (
                        <Sun className="h-3.5 w-3.5 text-yellow-500" />
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent>
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            </TooltipContent>
        </Tooltip>
    );
};

export const ThemeOnOffToggle = ThemeSwitcher;

export default ThemeSwitcher;
