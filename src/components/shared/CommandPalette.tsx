/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { FaArrowRight, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { LOGOUT_ITEM, SIDEBAR_ITEMS } from '../../constants';
import { useLogout } from '../../services/apis/authApi';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CommandItem {
    label: string;
    icon?: React.ReactNode;
    path?: string;
    action?: () => void;
    category: 'Navigation' | 'Action';
}

const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { mutate: logout } = useLogout();

    // Prepare all commands
    const allCommands: CommandItem[] = [
        ...SIDEBAR_ITEMS.map((item) => ({
            label: item.label,
            icon: item.icon,
            path: item.path,
            category: 'Navigation' as const,
        })),
        {
            label: 'Logout',
            icon: LOGOUT_ITEM.icon,
            action: () => logout(),
            category: 'Action' as const,
        },
    ];

    // Filter commands
    const filteredCommands = allCommands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredCommands.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = filteredCommands[selectedIndex];
                if (selected) {
                    handleSelect(selected);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    const handleSelect = (item: CommandItem) => {
        if (item.path) {
            navigate(item.path);
        } else if (item.action) {
            item.action();
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    <FaSearch className="text-gray-400 w-5 h-5 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 placeholder-gray-400"
                        placeholder="Search for pages or actions..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="hidden sm:flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded border border-gray-200">
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto py-2">
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={`${cmd.category}-${cmd.label}`}
                                    className={`
                                        flex items-center justify-between px-4 py-3 mx-2 rounded-lg text-left transition-colors
                                        ${index === selectedIndex ? 'bg-primary-5 text-primary' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                    onClick={() => handleSelect(cmd)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-lg ${index === selectedIndex ? 'text-primary' : 'text-gray-400'}`}
                                        >
                                            {cmd.icon}
                                        </span>
                                        <div>
                                            <span className="font-medium block">
                                                {cmd.label}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                                {cmd.category}
                                            </span>
                                        </div>
                                    </div>
                                    {index === selectedIndex && (
                                        <FaArrowRight className="w-3 h-3 text-primary opacity-50" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex gap-4">
                        <span>
                            <kbd className="font-sans">↑↓</kbd> to navigate
                        </span>
                        <span>
                            <kbd className="font-sans">↵</kbd> to select
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
