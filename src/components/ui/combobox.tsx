import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '../../utils/cn';
import { Button } from './button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyText = 'No results found.',
    className,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return q
            ? options.filter((o) =>
                  o.label.toLowerCase().includes(q)
              )
            : options;
    }, [options, query]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                    disabled={disabled}
                >
                    {value
                        ? options.find((option) => option.value === value)
                              ?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                    />
                    <CommandList>
                        {filtered.length === 0 && (
                            <CommandEmpty>{emptyText}</CommandEmpty>
                        )}
                        <CommandGroup>
                            {filtered.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(
                                            option.value === value
                                                ? ''
                                                : option.value
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === option.value
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
