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
        'bg-card file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
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

            // Check for yyyy-MM-dd format (standard)
            if (inputVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
                parsedDate = new Date(inputVal + 'T00:00:00');
                formattedDate = inputVal;
            }
            // Check for MM/DD/YYYY or M/D/YYYY format
            else if (inputVal.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const parts = inputVal.split('/');
                const month = parseInt(parts[0], 10) - 1;
                const day = parseInt(parts[1], 10);
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
            // Check for MM-DD-YYYY or M-D-YYYY format
            else if (inputVal.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                const parts = inputVal.split('-');
                const month = parseInt(parts[0], 10) - 1;
                const day = parseInt(parts[1], 10);
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
                // Don't call onChange for invalid dates
            }
        };

        const handleCalendarIconClick = (
            e: React.MouseEvent<HTMLButtonElement>
        ) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
                setOpen(true);
            }
        };

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <div className="relative w-full">
                    {startIcon && (
                        <span className={iconStartClasses}>{startIcon}</span>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        data-slot="input"
                        value={inputValue}
                        onChange={handleManualInput}
                        placeholder={
                            props.placeholder || 'YYYY-MM-DD or click calendar'
                        }
                        disabled={disabled}
                        className={cn(
                            baseClasses,
                            startIcon && iconPadding[inputSize].start,
                            iconPadding[inputSize].end,
                            !isValidDate &&
                                error !== false &&
                                'border-destructive',
                            className
                        )}
                        {...(props as Omit<
                            React.ComponentProps<'input'>,
                            'type' | 'value' | 'onChange' | 'className'
                        >)}
                    />
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            onClick={handleCalendarIconClick}
                            disabled={disabled}
                            className={cn(
                                iconEndClasses,
                                'pointer-events-auto cursor-pointer hover:text-foreground transition-colors',
                                disabled && 'pointer-events-none opacity-50'
                            )}
                            tabIndex={-1}
                        >
                            {endIcon || <CalendarIcon />}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
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
