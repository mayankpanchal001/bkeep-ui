import { useEffect, useRef, useState } from 'react';
import {
    FaCheck,
    FaChevronDown,
    FaDesktop,
    FaMoon,
    FaSun,
} from 'react-icons/fa';
import { useTheme, useThemeActions } from '../../stores/theme/themeSelectors';
import { Theme } from '../../stores/theme/themeStore';

type ThemeSwitcherProps = {
    compact?: boolean;
};

const ThemeSwitcher = ({ compact = false }: ThemeSwitcherProps) => {
    const currentTheme = useTheme();
    const { setTheme } = useThemeActions();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleThemeChange = (theme: Theme) => {
        setTheme(theme);
        setIsOpen(false);
    };

    const themes: Array<{
        id: Theme;
        name: string;
        icon: typeof FaSun;
        description: string;
    }> = [
        {
            id: 'light',
            name: 'Light',
            icon: FaSun,
            description: 'Light theme',
        },
        {
            id: 'dark',
            name: 'Dark',
            icon: FaMoon,
            description: 'Dark theme',
        },
        {
            id: 'system',
            name: 'System',
            icon: FaDesktop,
            description: 'Use system preference',
        },
    ];

    const getCurrentThemeData = () => {
        return themes.find((t) => t.id === currentTheme) || themes[2];
    };

    const currentThemeData = getCurrentThemeData();
    const CurrentIcon = currentThemeData.icon;

    const buttonClasses = compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 bg-white border border-primary-10 rounded-2 shadow-sm hover:shadow-md transition-all duration-200 ${buttonClasses} cursor-pointer hover:border-primary-20`}
                aria-label="Switch theme"
            >
                <CurrentIcon className="text-primary-50 w-4 h-4" />
                <span className="text-primary font-medium">
                    {currentThemeData.name}
                </span>
                <FaChevronDown
                    className={`text-primary-50 w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Popup */}
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Switch Theme
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Choose your preferred theme
                        </p>
                    </div>

                    {/* Theme List */}
                    <div className="overflow-y-auto">
                        {themes.map((theme) => {
                            const isSelected = theme.id === currentTheme;
                            const ThemeIcon = theme.icon;
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeChange(theme.id)}
                                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                                        isSelected
                                            ? 'bg-primary-5 hover:bg-primary-5'
                                            : ''
                                    } cursor-pointer`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                                isSelected
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <ThemeIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p
                                                className={`text-sm font-medium ${
                                                    isSelected
                                                        ? 'text-primary'
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                {theme.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {theme.description}
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <FaCheck className="text-primary w-4 h-4 shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ThemeOnOffToggle = () => {
    const theme = useTheme();
    const { setTheme } = useThemeActions();

    const isDark = theme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer ${
                isDark ? 'bg-dark-600' : 'bg-gray-200'
            }`}
            aria-label="Toggle theme"
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                } flex items-center justify-center shadow-sm`}
            >
                {isDark ? (
                    <FaMoon className="w-2.5 h-2.5 text-primary" />
                ) : (
                    <FaSun className="w-2.5 h-2.5 text-yellow-500" />
                )}
            </span>
        </button>
    );
};

export default ThemeSwitcher;
