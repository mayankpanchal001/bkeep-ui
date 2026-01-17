import { Check, Palette, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import {
    THEME_PALETTES,
    useThemePaletteStore,
    type ThemePalette,
} from '../../stores/theme/themePaletteStore';
import { cn } from '../../utils/cn';

interface ThemeColorSwatchesProps {
    palette: ThemePalette;
    size?: 'sm' | 'md';
}

const ThemeColorSwatches = ({
    palette,
    size = 'sm',
}: ThemeColorSwatchesProps) => {
    const colors = [
        palette.colors.primary,
        palette.colors.secondary,
        palette.colors.accent,
        palette.colors.muted,
    ];

    const sizeClass = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3';

    return (
        <div className="flex items-center gap-0.5 shrink-0">
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

export function SidebarThemeSwitcher() {
    const { selectedPaletteId, setPalette } = useThemePaletteStore();
    const [isAnimating, setIsAnimating] = useState(false);

    const selectedTheme = THEME_PALETTES.find(
        (t) => t.id === selectedPaletteId
    );

    const handleThemeChange = (paletteId: string) => {
        if (paletteId === selectedPaletteId) return;

        // Trigger animation state
        setIsAnimating(true);

        // Apply theme change (animation handled by applyThemePalette)
        setPalette(paletteId);

        // Remove animation indicator after transition
        setTimeout(() => {
            setIsAnimating(false);
        }, 600);
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            tooltip="Change theme"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Palette className="size-4" />
                            <span className="truncate">
                                {selectedTheme?.name || 'Theme'}
                            </span>
                            {isAnimating && (
                                <Sparkles className="ml-auto size-3 animate-pulse" />
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side="top"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Theme Manager
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {THEME_PALETTES.map((theme) => (
                            <DropdownMenuItem
                                key={theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className="gap-2 p-2 cursor-pointer"
                            >
                                <ThemeColorSwatches palette={theme} />
                                <span className="flex-1 truncate">
                                    {theme.name}
                                </span>
                                {theme.id === selectedPaletteId && (
                                    <Check className="ml-auto size-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
