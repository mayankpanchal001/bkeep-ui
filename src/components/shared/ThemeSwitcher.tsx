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
                    className={`w-8 h-8 flex justify-center items-center cursor-pointer `}
                >
                    {isDark ? (
                        <Moon className="h-5 w-5 text-primary" />
                    ) : (
                        <Sun className="h-5  w-5 text-primary" />
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
