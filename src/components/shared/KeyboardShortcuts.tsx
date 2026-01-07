import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import Input from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Copy, Info, Sparkles, Star, StarOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { showSuccessToast } from '../../utills/toast';
import TabNav from './TabNav';

interface KeyboardShortcutsProps {
    isOpen: boolean;
    onClose: () => void;
}

type OSKind = 'mac' | 'windows';
// list-only view

const detectOS = (): OSKind => {
    if (typeof navigator === 'undefined') return 'mac';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) return 'mac';
    return 'windows';
};

const KeyCap = ({ label }: { label: string }) => (
    <kbd className="px-2 py-1 text-xs font-semibold text-primary/70 bg-white dark:bg-slate-800 rounded-md border border-primary/10 shadow-sm">
        {label}
    </kbd>
);

export default function KeyboardShortcuts({
    isOpen,
    onClose,
}: KeyboardShortcutsProps) {
    const [osView, setOsView] = useState<OSKind>('mac');
    // list-only view
    const [query, setQuery] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>(
        JSON.parse(localStorage.getItem('bk_shortcut_favs') || '[]')
    );

    useEffect(() => {
        if (isOpen) setOsView(detectOS());
    }, [isOpen]);

    const isMac = osView === 'mac';
    const mod = isMac ? '⌘' : 'Ctrl';

    const sections = useMemo(
        () => [
            {
                id: 'global',
                title: 'Global',
                items: [
                    {
                        id: 'cmd_palette',
                        label: 'Open Command Palette',
                        keys: [mod, 'K'],
                    },
                    {
                        id: 'shortcuts_panel',
                        label: 'Open Keyboard Shortcuts',
                        keys: ['?'],
                    },
                    {
                        id: 'close_any',
                        label: 'Close dialog/panel',
                        keys: ['Esc'],
                    },
                ],
            },
            {
                id: 'palette',
                title: 'Command Palette',
                items: [
                    {
                        id: 'navigate',
                        label: 'Navigate items',
                        keys: ['↑', '↓'],
                    },
                    { id: 'select', label: 'Select item', keys: ['Enter'] },
                    { id: 'dismiss', label: 'Dismiss', keys: ['Esc'] },
                ],
            },
        ],
        [mod]
    );

    const allItems = useMemo(
        () =>
            sections.flatMap((s) =>
                s.items.map((i) => ({
                    section: s.id,
                    sectionTitle: s.title,
                    ...i,
                }))
            ),
        [sections]
    );

    const filtered = useMemo(() => {
        if (!query.trim()) return allItems;
        const q = query.toLowerCase();
        return allItems.filter(
            (i) =>
                i.label.toLowerCase().includes(q) ||
                i.sectionTitle.toLowerCase().includes(q) ||
                i.keys.join('+').toLowerCase().includes(q)
        );
    }, [allItems, query]);

    const isFav = (id: string) => favorites.includes(id);
    const toggleFav = (id: string) => {
        const next = isFav(id)
            ? favorites.filter((x) => x !== id)
            : [...favorites, id];
        setFavorites(next);
        localStorage.setItem('bk_shortcut_favs', JSON.stringify(next));
    };

    const copyKeys = (keys: string[]) => {
        const text = keys.join('+');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(text);
            showSuccessToast('Shortcut copied');
            setTimeout(() => setCopied(null), 1200);
        });
    };

    return (
        <Drawer
            direction="right"
            open={isOpen}
            onOpenChange={(o) => !o && onClose()}
        >
            <DrawerContent className="sm:max-w-[820px] w-[92vw] border-l">
                <div className="bg-linear-to-br from-primary/10 to-transparent p-4 border-b border-primary/10">
                    <DrawerHeader className="p-0">
                        <div className="flex flex-col gap-4 justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <DrawerTitle className="text-lg">
                                    Keyboard Shortcuts
                                </DrawerTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <TabNav
                                    items={[
                                        { id: 'mac', label: 'Mac' },
                                        { id: 'windows', label: 'Windows' },
                                    ]}
                                    value={osView}
                                    onChange={(id) => setOsView(id as OSKind)}
                                />
                                <div className="hidden sm:flex items-center gap-1 text-xs text-primary/60">
                                    <Info className="w-3.5 h-3.5" />
                                    <span>Press ? anywhere to open</span>
                                </div>
                            </div>
                        </div>
                        <DrawerDescription>
                            Tailored for {isMac ? 'macOS' : 'Windows'}. Filter,
                            favorite, and copy any shortcut.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="mt-3">
                        <Input
                            placeholder="Type to filter shortcuts..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                        <DrawerClose
                            className="text-primary/60 hover:text-primary text-sm"
                            onClick={onClose}
                        >
                            Close
                        </DrawerClose>
                    </div>
                </div>

                {
                    <ScrollArea className="h-[calc(80vh-160px)]">
                        <div className="p-4 space-y-4">
                            {sections.map((sec) => {
                                const matches = sec.items.filter((i) =>
                                    filtered.some((f) => f.id === i.id)
                                );
                                return (
                                    <div key={sec.id}>
                                        <div className="text-xs font-semibold text-primary/60 mb-2">
                                            {sec.title}
                                        </div>
                                        {matches.length === 0 ? (
                                            <div className="text-xs text-primary/40">
                                                No matches
                                            </div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {matches.map((it) => (
                                                    <li
                                                        key={it.id}
                                                        className="group flex items-center gap-2 rounded-md border border-primary/10 px-3 py-2 hover:bg-primary/5"
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                toggleFav(it.id)
                                                            }
                                                            className="p-1 rounded-md text-primary/40 hover:text-primary"
                                                        >
                                                            {isFav(it.id) ? (
                                                                <Star className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <StarOff className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                        <span className="text-sm flex-1">
                                                            {it.label}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {it.keys.map(
                                                                (kk, idx) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        <KeyCap
                                                                            label={
                                                                                kk
                                                                            }
                                                                        />
                                                                        {idx <
                                                                            it
                                                                                .keys
                                                                                .length -
                                                                                1 && (
                                                                            <span className="text-primary/30">
                                                                                +
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                )
                                                            )}
                                                            <button
                                                                onClick={() =>
                                                                    copyKeys(
                                                                        it.keys
                                                                    )
                                                                }
                                                                className="ml-2 p-1 rounded-md text-primary/40 hover:text-primary"
                                                            >
                                                                {copied ===
                                                                it.keys.join(
                                                                    '+'
                                                                ) ? (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                }

                <DrawerFooter className="p-4">
                    <div className="flex items-center flex-col gap-4 justify-between text-xs text-primary/50">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <KeyCap label="↑/↓" /> navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <KeyCap label="↵" /> select
                            </span>
                            <span className="flex items-center gap-1">
                                <KeyCap label="Esc" /> close
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            Built for speed and accessibility
                        </div>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
