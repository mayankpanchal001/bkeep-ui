import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { CalendarIcon, Eye, EyeOff, Loader2, X } from 'lucide-react';
import * as React from 'react';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface InputProps
    extends Omit<React.ComponentProps<'input'>, 'size'> {
    /** Icon to display at the start of the input */
    startIcon?: React.ReactNode;
    /** Icon to display at the end of the input */
    endIcon?: React.ReactNode;
    /** Show loading spinner at the end */
    loading?: boolean;
    /** Show clear button when input has value */
    clearable?: boolean;
    /** Callback when clear button is clicked */
    onClear?: () => void;
    /** Input size variant */
    inputSize?: 'sm' | 'default' | 'lg';
    /** Error state */
    error?: boolean;
    /** Success state */
    success?: boolean;
}

export default function Input({
    className,
    type,
    startIcon,
    endIcon,
    loading = false,
    clearable = false,
    onClear,
    inputSize = 'default',
    error,
    success,
    value,
    onChange,
    disabled,
    ...props
}: InputProps) {
    const [open, setOpen] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Date input state - always declared to follow Rules of Hooks
    const dateValue =
        type === 'date' ? (value as string | undefined) : undefined;
    const [inputValue, setInputValue] = React.useState(dateValue || '');
    const [isValidDate, setIsValidDate] = React.useState(true);

    // Update input value when external value changes (only for date type)
    React.useEffect(() => {
        if (
            type === 'date' &&
            dateValue !== undefined &&
            dateValue !== inputValue
        ) {
            setInputValue(dateValue || '');
            setIsValidDate(true);
        }
    }, [type, dateValue, inputValue]);

    const isPassword = type === 'password';
    const hasValue = value !== undefined && value !== '';
    const showClear = clearable && hasValue && !disabled && !loading;

    // Size classes
    const sizeClasses = {
        sm: 'h-8 text-xs px-2.5 [&_svg]:size-3.5',
        default: 'h-9 text-sm px-3 [&_svg]:size-4',
        lg: 'h-10 text-base px-4 [&_svg]:size-5',
    };

    const iconPadding = {
        sm: { start: 'pl-8', end: 'pr-8' },
        default: { start: 'pl-9', end: 'pr-9' },
        lg: { start: 'pl-11', end: 'pr-11' },
    };

    const baseClasses = cn(
        'bg-card file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border py-1 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        error &&
        'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
        success &&
        'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20',
        sizeClasses[inputSize]
    );

    // Icon size classes matching button component sizes
    const iconSizeClasses = {
        sm: '[&_svg]:size-3.5',
        default: '[&_svg]:size-4',
        lg: '[&_svg]:size-5',
    };

    const iconBaseClasses = cn(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center',
        iconSizeClasses[inputSize]
    );
    const iconStartClasses = cn(
        iconBaseClasses,
        inputSize === 'sm'
            ? 'left-2'
            : inputSize === 'lg'
                ? 'left-3'
                : 'left-2.5'
    );
    const iconEndClasses = cn(
        'absolute top-1/2 -translate-y-1/2 text-muted-foreground inline-flex items-center justify-center',
        iconSizeClasses[inputSize],
        inputSize === 'sm'
            ? 'right-2'
            : inputSize === 'lg'
                ? 'right-3'
                : 'right-2.5'
    );

    const handleClear = () => {
        if (onClear) {
            onClear();
        } else if (onChange) {
            const syntheticEvent = {
                target: { value: '' },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        }
        inputRef.current?.focus();
    };

    // Handle date input type with calendar popover and manual entry
    if (type === 'date') {
        const selectedDate = dateValue ? new Date(dateValue) : undefined;
        const hasDateValue = inputValue !== '';
        const showDateClear = clearable && hasDateValue && !disabled;

        // Calculate right padding based on buttons shown
        const getDateEndPadding = () => {
            if (showDateClear) {
                return inputSize === 'sm'
                    ? 'pr-[4.5rem]'
                    : inputSize === 'lg'
                        ? 'pr-24'
                        : 'pr-20';
            }
            return inputSize === 'sm'
                ? 'pr-10'
                : inputSize === 'lg'
                    ? 'pr-12'
                    : 'pr-11';
        };

        // Format display value in dd/mm/yyyy format
        const getDisplayValue = () => {
            if (!inputValue) return '';
            // If the date is valid and in yyyy-MM-dd format, show dd/mm/yyyy
            if (inputValue.match(/^\d{4}-\d{2}-\d{2}$/) && isValidDate) {
                const date = new Date(inputValue + 'T00:00:00');
                if (!isNaN(date.getTime())) {
                    return format(date, 'dd/MM/yyyy');
                }
            }
            return inputValue;
        };

        const handleDateSelect = (date: Date | undefined) => {
            if (date && onChange) {
                const formattedDate = format(date, 'yyyy-MM-dd');
                setInputValue(formattedDate);
                setIsValidDate(true);
                const syntheticEvent = {
                    target: { value: formattedDate },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            } else if (!date && onChange) {
                setInputValue('');
                setIsValidDate(true);
                const syntheticEvent = {
                    target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            }
            setOpen(false);
        };

        const handleDateClear = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setInputValue('');
            setIsValidDate(true);
            if (onChange) {
                const syntheticEvent = {
                    target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            }
            inputRef.current?.focus();
        };

        const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputVal = e.target.value;
            setInputValue(inputVal);

            // Allow empty input
            if (inputVal === '') {
                setIsValidDate(true);
                if (onChange) {
                    onChange(e);
                }
                return;
            }

            // Try to parse the date in various formats
            let parsedDate: Date | null = null;
            let formattedDate = inputVal;

            // Check for dd/mm/yyyy format (primary format)
            if (inputVal.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const parts = inputVal.split('/');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                parsedDate = new Date(year, month, day);
                if (
                    parsedDate.getFullYear() === year &&
                    parsedDate.getMonth() === month &&
                    parsedDate.getDate() === day
                ) {
                    formattedDate = format(parsedDate, 'yyyy-MM-dd');
                } else {
                    parsedDate = null;
                }
            }
            // Check for dd-mm-yyyy format
            else if (inputVal.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                const parts = inputVal.split('-');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                parsedDate = new Date(year, month, day);
                if (
                    parsedDate.getFullYear() === year &&
                    parsedDate.getMonth() === month &&
                    parsedDate.getDate() === day
                ) {
                    formattedDate = format(parsedDate, 'yyyy-MM-dd');
                } else {
                    parsedDate = null;
                }
            }
            // Check for yyyy-MM-dd format (ISO standard)
            else if (inputVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
                parsedDate = new Date(inputVal + 'T00:00:00');
                formattedDate = inputVal;
            }
            // Try generic Date parsing as fallback
            else {
                parsedDate = new Date(inputVal);
                if (!isNaN(parsedDate.getTime())) {
                    formattedDate = format(parsedDate, 'yyyy-MM-dd');
                } else {
                    parsedDate = null;
                }
            }

            const isValid = parsedDate !== null && !isNaN(parsedDate.getTime());

            if (isValid) {
                setIsValidDate(true);
                if (onChange) {
                    const syntheticEvent = {
                        target: { value: formattedDate },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                }
            } else {
                // Still allow typing, but mark as invalid
                setIsValidDate(false);
            }
        };

        // Button size classes
        const calendarButtonSize = {
            sm: 'h-6 w-6',
            default: 'h-7 w-7',
            lg: 'h-8 w-8',
        };

        const clearButtonSize = {
            sm: 'h-5 w-5',
            default: 'h-6 w-6',
            lg: 'h-7 w-7',
        };

        // Year range for the calendar dropdown
        const currentYear = new Date().getFullYear();
        const fromYear = currentYear - 100;
        const toYear = currentYear + 50;

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <div className="relative w-full group">
                    {startIcon && (
                        <span className={iconStartClasses}>{startIcon}</span>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        data-slot="input"
                        value={getDisplayValue()}
                        onChange={handleManualInput}
                        placeholder={props.placeholder || 'DD/MM/YYYY'}
                        disabled={disabled}
                        className={cn(
                            baseClasses,
                            startIcon && iconPadding[inputSize].start,
                            getDateEndPadding(),
                            !isValidDate &&
                            error !== false &&
                            'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
                            'tabular-nums',
                            className
                        )}
                        {...(props as Omit<
                            React.ComponentProps<'input'>,
                            'type' | 'value' | 'onChange' | 'className'
                        >)}
                    />
                    <div
                        className={cn(
                            'absolute top-1/2 -translate-y-1/2 flex items-center gap-1',
                            inputSize === 'sm'
                                ? 'right-1.5'
                                : inputSize === 'lg'
                                    ? 'right-2.5'
                                    : 'right-2'
                        )}
                    >
                        {showDateClear && (
                            <button
                                type="button"
                                onClick={handleDateClear}
                                className={cn(
                                    'inline-flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all duration-150',
                                    clearButtonSize[inputSize],
                                    iconSizeClasses[inputSize]
                                )}
                                tabIndex={-1}
                                aria-label="Clear date"
                            >
                                <X />
                            </button>
                        )}
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                disabled={disabled}
                                className={cn(
                                    'inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                                    calendarButtonSize[inputSize],
                                    iconSizeClasses[inputSize],
                                    disabled && 'pointer-events-none opacity-50'
                                )}
                                tabIndex={-1}
                                aria-label="Open calendar"
                            >
                                {endIcon || <CalendarIcon />}
                            </button>
                        </PopoverTrigger>
                    </div>
                    <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        sideOffset={4}
                    >
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            defaultMonth={selectedDate}
                            captionLayout="dropdown"
                            fromYear={fromYear}
                            toYear={toYear}
                            initialFocus
                        />
                    </PopoverContent>
                </div>
            </Popover>
        );
    }

    // Determine what to show at the end
    const hasEndAdornment = endIcon || loading || showClear || isPassword;
    const hasStartAdornment = !!startIcon;

    // Password toggle
    const actualType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="relative w-full">
            {hasStartAdornment && (
                <span className={iconStartClasses}>{startIcon}</span>
            )}
            <input
                ref={inputRef}
                type={actualType}
                data-slot="input"
                disabled={disabled}
                className={cn(
                    baseClasses,
                    hasStartAdornment && iconPadding[inputSize].start,
                    hasEndAdornment && iconPadding[inputSize].end,
                    className
                )}
                value={value}
                onChange={onChange}
                {...props}
            />
            {hasEndAdornment && (
                <span className={iconEndClasses}>
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : showClear ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={cn(
                                'pointer-events-auto p-0.5 rounded-sm hover:bg-muted transition-colors',
                                iconSizeClasses[inputSize]
                            )}
                            tabIndex={-1}
                        >
                            <X />
                        </button>
                    ) : isPassword ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={cn(
                                'pointer-events-auto p-0.5 rounded-sm hover:bg-muted transition-colors',
                                iconSizeClasses[inputSize]
                            )}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                    ) : (
                        endIcon
                    )}
                </span>
            )}
        </div>
    );
}
