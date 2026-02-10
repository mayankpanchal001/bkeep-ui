import { Moon, Sun } from 'lucide-react';
import type { MouseEvent } from 'react';
import { switchThemeAt } from '../../hooks/useThemeSync';
import { useTheme } from '../../stores/theme/themeSelectors';
import { Button } from '../ui/button';

const ThemeSwitcher = () => {
    const theme = useTheme();

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        switchThemeAt(newTheme, e.clientX, e.clientY);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Toggle theme"
            onClick={handleClick}
        >
            {theme === 'light' ? (
                <Sun className="size-5!" />
            ) : (
                <Moon className="size-5!" />
            )}
        </Button>
    );
};

export default ThemeSwitcher;
