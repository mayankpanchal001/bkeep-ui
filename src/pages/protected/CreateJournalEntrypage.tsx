import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import PageHeader from '@/components/shared/PageHeader';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/utils/cn';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import {
    useCreateJournalEntry,
    useJournalEntries,
} from '../../services/apis/journalApi';
import type { CreateJournalEntryPayload } from '../../types/journal';

export default function CreateJournalEntrypage() {
    const navigate = useNavigate();
    const { mutate: createEntry, isPending } = useCreateJournalEntry();

    const { data: latestEntries, isLoading } = useJournalEntries({
        page: 1,
        limit: 1,
        sort: 'createdAt',
        order: 'desc',
    });
    const nextEntryNumber = useMemo(() => {
        if (isLoading) return '';
        const lastEntry = latestEntries?.data?.journalEntries?.[0];
        const next = getNextJournalEntryNumber(lastEntry?.entryNumber);
        return next;
    }, [latestEntries, isLoading]);

    const queryClient = useQueryClient();

    const handleSubmit = (data: CreateJournalEntryPayload) => {
        createEntry(data, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['journal-entries'],
                });
                navigate('/journal-entries');
            },
        });
    };

    const handleCancel = () => {
        navigate('/journal-entries');
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title="New Journal Entry"
                subtitle="Create a new journal entry"
            />

            <div className="bg-card rounded-lg border border-primary/10 p-4">
                <JournalEntryForm
                    key={nextEntryNumber || 'loading'}
                    initialData={{
                        entryNumber: nextEntryNumber,
                    }}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isPending}
                />
            </div>
        </div>
    );
}

function getNextJournalEntryNumber(current: string | undefined | null): string {
    if (!current) return '1';

    //Numbers
    if (/^\d+$/.test(current)) {
        const nextNum = parseInt(current, 10) + 1;

        if (current.startsWith('0') && current.length > 1) {
            return String(nextNum).padStart(current.length, '0');
        }
        return String(nextNum);
    }

    const match = current.match(/^(.*?)(\d+)$/);
    if (match) {
        const prefix = match[1];
        const numberPart = match[2];
        const nextNum = parseInt(numberPart, 10) + 1;

        const nextNumStr = String(nextNum).padStart(numberPart.length, '0');
        return prefix + nextNumStr;
    }

    /* letters updating */

    if (/^[a-zA-Z]+$/.test(current)) {
        const chars = current.split('');
        let i = chars.length - 1;
        while (i >= 0) {
            const charCode = chars[i].charCodeAt(0);
            if (chars[i] === 'z') {
                chars[i] = 'a';
                i--;
            } else if (chars[i] === 'Z') {
                chars[i] = 'A';
                i--;
            } else {
                chars[i] = String.fromCharCode(charCode + 1);
                return chars.join('');
            }
        }
    }
    return '1';
}

//Number format
interface CurrencyInputProps
    extends Omit<NumericFormatProps, 'className' | 'value' | 'onValueChange'> {
    value?: string | number;
    onValueChange?: (value: string) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function CurrencyInput({
    className,
    value,
    onValueChange,
    disabled,
    ...props
}: CurrencyInputProps) {
    return (
        <NumericFormat
            value={value}
            onValueChange={(values) => {
                onValueChange?.(values.value);
            }}
            thousandSeparator=","
            decimalScale={2}
            fixedDecimalScale={true}
            prefix="$"
            allowNegative={false}
            disabled={disabled}
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className
            )}
            displayType="input"
            type="text"
            {...props}
        />
    );
}
