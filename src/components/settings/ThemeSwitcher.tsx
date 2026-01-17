import { Check, Palette, Search, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    THEME_PALETTES,
    useThemePaletteStore,
    type ThemePalette,
} from '../../stores/theme/themePaletteStore';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface ThemeSwitcherProps {
    className?: string;
}

const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
    const { selectedPaletteId, setPalette } = useThemePaletteStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);

    const filteredThemes = useMemo(() => {
        if (!searchQuery.trim()) return THEME_PALETTES;
        const query = searchQuery.toLowerCase();
        return THEME_PALETTES.filter(
            (theme) =>
                theme.name.toLowerCase().includes(query) ||
                theme.description?.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleSelectTheme = (paletteId: string) => {
        setPalette(paletteId);
        setOpen(false);
    };

    const handleRandomTheme = () => {
        const randomIndex = Math.floor(Math.random() * THEME_PALETTES.length);
        const randomTheme = THEME_PALETTES[randomIndex];
        setPalette(randomTheme.id);
    };

    const selectedTheme = THEME_PALETTES.find(
        (t) => t.id === selectedPaletteId
    );

    return (
        <div className={cn('space-y-4', className)}>
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

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {selectedTheme && (
                                    <ThemeColorSwatches
                                        palette={selectedTheme}
                                    />
                                )}
                            </div>
                            <div className="text-left">
                                <div className="font-medium">
                                    {selectedTheme?.name || 'Select Theme'}
                                </div>
                                {selectedTheme?.description && (
                                    <div className="text-xs text-muted-foreground">
                                        {selectedTheme.description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Palette className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command className="rounded-lg border-0">
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <CommandInput
                                placeholder="Search themes..."
                                value={searchQuery}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setSearchQuery(e.target.value)}
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 border-b">
                            <span className="text-xs text-muted-foreground">
                                {filteredThemes.length} theme
                                {filteredThemes.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={handleRandomTheme}
                                    tooltip="Random theme"
                                >
                                    <Shuffle className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                        <CommandList className="max-h-[400px]">
                            <CommandEmpty>No themes found.</CommandEmpty>
                            <CommandGroup heading="Built-in Themes">
                                {filteredThemes.map((theme) => (
                                    <CommandItem
                                        key={theme.id}
                                        value={theme.id}
                                        onSelect={() =>
                                            handleSelectTheme(theme.id)
                                        }
                                        className={cn(
                                            'flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer',
                                            selectedPaletteId === theme.id &&
                                                'bg-accent'
                                        )}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <ThemeColorSwatches
                                                palette={theme}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {theme.name}
                                                </div>
                                                {theme.description && (
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {theme.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {selectedPaletteId === theme.id && (
                                            <Check className="h-4 w-4 shrink-0 text-primary" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
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
