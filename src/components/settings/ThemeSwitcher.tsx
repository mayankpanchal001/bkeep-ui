import { Check, ChevronDown, ChevronUp, Palette, Shuffle } from 'lucide-react';
import { useState } from 'react';
import {
    THEME_PALETTES,
    useThemePaletteStore,
    type ThemePalette,
} from '../../stores/theme/themePaletteStore';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';

interface ThemeSwitcherProps {
    className?: string;
}

const INITIAL_THEMES_TO_SHOW = 12;

const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
    const { selectedPaletteId, setPalette } = useThemePaletteStore();
    const [showAll, setShowAll] = useState(false);

    const handleSelectTheme = (paletteId: string) => {
        setPalette(paletteId);
    };

    const handleRandomTheme = () => {
        const randomIndex = Math.floor(Math.random() * THEME_PALETTES.length);
        const randomTheme = THEME_PALETTES[randomIndex];
        setPalette(randomTheme.id);
    };

    const selectedTheme = THEME_PALETTES.find(
        (t) => t.id === selectedPaletteId
    );

    const themesToDisplay = showAll
        ? THEME_PALETTES
        : THEME_PALETTES.slice(0, INITIAL_THEMES_TO_SHOW);
    const hasMoreThemes = THEME_PALETTES.length > INITIAL_THEMES_TO_SHOW;

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Theme Palette</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRandomTheme}
                        className="h-8 w-8"
                        tooltip="Random theme"
                    >
                        <Shuffle className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Selected Theme Display */}
            {selectedTheme && (
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-3">
                        <ThemeColorSwatches palette={selectedTheme} />
                        <div className="flex-1">
                            <div className="font-medium">
                                {selectedTheme.name}
                            </div>
                            {selectedTheme.description && (
                                <div className="text-xs text-muted-foreground">
                                    {selectedTheme.description}
                                </div>
                            )}
                        </div>
                        <Check className="h-5 w-5 text-primary" />
                    </div>
                </div>
            )}

            {/* Themes Grid */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {themesToDisplay.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleSelectTheme(theme.id)}
                            className={cn(
                                'group relative rounded-lg border-2 p-3 transition-all duration-200',
                                'hover:scale-[1.02]  hover:border-primary/30',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                                selectedPaletteId === theme.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:bg-accent/30'
                            )}
                            title={theme.name}
                        >
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center justify-center">
                                    <ThemeColorSwatches
                                        palette={theme}
                                        size="md"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {theme.name}
                                    </p>
                                </div>
                            </div>
                            {selectedPaletteId === theme.id && (
                                <div className="absolute top-1.5 right-1.5">
                                    <div className="rounded-full bg-primary p-0.5">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* View All / Show Less Button */}
                {hasMoreThemes && (
                    <div className="flex justify-center pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAll(!showAll)}
                            className="gap-2"
                        >
                            {showAll ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    View All ({THEME_PALETTES.length} themes)
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ThemeColorSwatchesProps {
    palette: ThemePalette;
    size?: 'sm' | 'md';
}

const ThemeColorSwatches = ({
    palette,
    size = 'md',
}: ThemeColorSwatchesProps) => {
    const colors = [
        palette.colors.primary,
        palette.colors.secondary,
        palette.colors.accent,
        palette.colors.muted,
    ];

    const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    return (
        <div className="flex items-center gap-1 shrink-0">
            {colors.map((color, index) => (
                <div
                    key={index}
                    className={cn(
                        'rounded-full border border-border/50',
                        sizeClass
                    )}
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
};

export default ThemeSwitcher;
