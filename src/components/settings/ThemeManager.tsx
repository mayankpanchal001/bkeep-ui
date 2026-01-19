import { Check, Palette, Search, Shuffle, Sparkles, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    THEME_PALETTES,
    useThemePaletteStore,
    type ThemePalette,
} from '../../stores/theme/themePaletteStore';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { CardDescription, CardTitle } from '../ui/card';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const ThemeManager = () => {
    const { selectedPaletteId, setPalette } = useThemePaletteStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

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
        if (paletteId === selectedPaletteId) {
            setOpen(false);
            return;
        }

        // Use View Transitions API if available for smooth animation
        if ('startViewTransition' in document) {
            setIsTransitioning(true);
            (
                document as Document & {
                    startViewTransition: (callback: () => void) => void;
                }
            ).startViewTransition(() => {
                setPalette(paletteId);
                setTimeout(() => {
                    setIsTransitioning(false);
                    setOpen(false);
                }, 300);
            });
        } else {
            setIsTransitioning(true);
            setPalette(paletteId);
            setTimeout(() => {
                setIsTransitioning(false);
                setOpen(false);
            }, 600);
        }
    };

    const handleRandomTheme = () => {
        const availableThemes = filteredThemes.filter(
            (t) => t.id !== selectedPaletteId
        );
        if (availableThemes.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableThemes.length);
        const randomTheme = availableThemes[randomIndex];
        handleSelectTheme(randomTheme.id);
    };

    const selectedTheme = THEME_PALETTES.find(
        (t) => t.id === selectedPaletteId
    );

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Palette className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Theme Manager</CardTitle>
                            <CardDescription>
                                Choose from {THEME_PALETTES.length} beautiful themes
                            </CardDescription>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRandomTheme}
                        className="h-9 w-9"
                        tooltip="Random theme"
                        disabled={isTransitioning}
                    >
                        <Shuffle className="h-4 w-4" />
                    </Button>
                </div>

                {/* Current Theme Display */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-between h-auto py-4 px-4 group hover:border-primary/50 transition-all"
                            disabled={isTransitioning}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {selectedTheme && (
                                    <div className="relative">
                                        <ThemeColorSwatches
                                            palette={selectedTheme}
                                            size="md"
                                        />
                                        {isTransitioning && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="h-3 w-3 animate-pulse text-primary" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-left flex-1 min-w-0">
                                    <div className="font-semibold text-sm flex items-center gap-2">
                                        {selectedTheme?.name || 'Select Theme'}
                                        {isTransitioning && (
                                            <Zap className="h-3.5 w-3.5 animate-spin text-primary" />
                                        )}
                                    </div>
                                    {selectedTheme?.description && (
                                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {selectedTheme.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Palette className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[500px] p-0"
                        align="start"
                        side="bottom"
                        sideOffset={8}
                    >
                        <Command className="rounded-lg">
                            <div className="flex items-center border-b px-4 py-3 bg-muted/30">
                                <Search className="mr-3 h-4 w-4 shrink-0 opacity-50" />
                                <CommandInput
                                    placeholder="Search themes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
                                />
                            </div>
                            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/20">
                                <span className="text-xs font-medium text-muted-foreground">
                                    {filteredThemes.length} theme
                                    {filteredThemes.length !== 1 ? 's' : ''}{' '}
                                    available
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRandomTheme}
                                    className="h-7 text-xs"
                                    disabled={isTransitioning}
                                >
                                    <Shuffle className="h-3 w-3 mr-1.5" />
                                    Random
                                </Button>
                            </div>
                            <CommandList className="max-h-[450px]">

                                <CommandGroup heading="Available Themes">
                                    <div className="grid grid-cols-1 gap-1 p-2">
                                        {filteredThemes.map((theme) => (
                                            <CommandItem
                                                key={theme.id}
                                                value={theme.id}
                                                onSelect={() =>
                                                    handleSelectTheme(theme.id)
                                                }
                                                className={cn(
                                                    'flex items-center justify-between gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all',
                                                    'hover:bg-accent/50',
                                                    selectedPaletteId ===
                                                    theme.id &&
                                                    'bg-primary/10 border border-primary/20',
                                                    isTransitioning &&
                                                    'opacity-60 pointer-events-none'
                                                )}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <ThemeColorSwatches
                                                        palette={theme}
                                                        size="md"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm flex items-center gap-2">
                                                            {theme.name}
                                                            {selectedPaletteId ===
                                                                theme.id && (
                                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                                                                        Active
                                                                    </span>
                                                                )}
                                                        </div>
                                                        {theme.description && (
                                                            <div className="text-left text-xs text-muted-foreground mt-0.5 line-clamp-1">
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
                                    </div>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Theme Preview Grid */}
                {!open && (
                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Quick Preview
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Click to switch themes instantly
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                {THEME_PALETTES.length} total
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {THEME_PALETTES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => handleSelectTheme(theme.id)}
                                    className={cn(
                                        'group relative rounded-xl border-2 p-3 transition-all duration-200',
                                        'hover:scale-[1.02] hover:shadow-lg hover:border-primary/30',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                                        selectedPaletteId === theme.id
                                            ? 'border-primary shadow-md shadow-primary/20 bg-primary/5'
                                            : 'border-border bg-card hover:bg-accent/30',
                                        isTransitioning &&
                                        'opacity-60 pointer-events-none'
                                    )}
                                    disabled={isTransitioning}
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
                                        <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-lg ring-2 ring-background">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-200 pointer-events-none" />
                                </button>
                            ))}
                        </div>


                    </div>
                )}
            </div>
        </>
    );
};

interface ThemeColorSwatchesProps {
    palette: ThemePalette;
    size?: 'sm' | 'md' | 'lg';
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

    const sizeClasses = {
        sm: 'h-2.5 w-2.5',
        md: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    return (
        <div className="grid grid-cols-2 gap-1">
            {colors.map((color, index) => (
                <div
                    key={index}
                    className={cn(
                        'rounded-full border border-border/50 shadow-sm transition-transform hover:scale-110',
                        sizeClasses[size]
                    )}
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
};

export default ThemeManager;
