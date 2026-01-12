import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type InputProps = React.ComponentProps<'input'> & {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
};

export default function Input({
    className,
    type,
    startIcon,
    endIcon,
    value,
    onChange,
    ...props
}: InputProps) {
    const [open, setOpen] = React.useState(false);
    const withAdornment = !!startIcon || !!endIcon;
    const baseClasses = cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
    );

    // Handle date input type with calendar popover
    if (type === 'date') {
        const dateValue = value as string | undefined;
        const selectedDate = dateValue ? new Date(dateValue) : undefined;

        const handleDateSelect = (date: Date | undefined) => {
            if (date && onChange) {
                // Format date as yyyy-MM-dd for input value
                const formattedDate = format(date, 'yyyy-MM-dd');
                const syntheticEvent = {
                    target: { value: formattedDate },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            } else if (!date && onChange) {
                // Handle clearing the date
                const syntheticEvent = {
                    target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            }
            setOpen(false);
        };

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative w-full">
                        {startIcon && (
                            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center z-10">
                                {startIcon}
                            </span>
                        )}
                        <input
                            type="text"
                            readOnly
                            data-slot="input"
                            value={
                                selectedDate ? format(selectedDate, 'PPP') : ''
                            }
                            placeholder={props.placeholder || 'Select date'}
                            className={cn(
                                baseClasses,
                                startIcon && 'pl-9',
                                !endIcon && !startIcon && 'pr-9',
                                endIcon && 'pr-9',
                                'cursor-pointer'
                            )}
                            onClick={() => setOpen(true)}
                            {...(props as Omit<
                                React.ComponentProps<'input'>,
                                'type' | 'value' | 'onChange' | 'className'
                            >)}
                        />
                        {endIcon ? (
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center z-10">
                                {endIcon}
                            </span>
                        ) : (
                            !startIcon && (
                                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-primary/60 inline-flex items-center justify-center z-10">
                                    <CalendarIcon className="h-4 w-4" />
                                </span>
                            )
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        );
    }

    if (!withAdornment) {
        return (
            <input
                type={type}
                data-slot="input"
                className={baseClasses}
                value={value}
                onChange={onChange}
                {...props}
            />
        );
    }

    return (
        <div className="relative w-full">
            {startIcon ? (
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center">
                    {startIcon}
                </span>
            ) : null}
            <input
                type={type}
                data-slot="input"
                className={cn(
                    baseClasses,
                    startIcon && 'pl-9',
                    endIcon && 'pr-9'
                )}
                value={value}
                onChange={onChange}
                {...props}
            />
            {endIcon ? (
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center">
                    {endIcon}
                </span>
            ) : null}
        </div>
    );
}
