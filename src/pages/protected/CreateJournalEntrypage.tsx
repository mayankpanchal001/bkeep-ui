import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import PageHeader from '@/components/shared/PageHeader';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
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
    if (/^\d+$/.test(current)) {
        const num = parseInt(current, 10);

        const nextNum = num + 1;

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
    return '1';
}
