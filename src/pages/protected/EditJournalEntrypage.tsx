import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import Loading from '@/components/shared/Loading';
import PageHeader from '@/components/shared/PageHeader';
import { useNavigate, useParams } from 'react-router';
import {
    useJournalEntry,
    useUpdateJournalEntry,
} from '../../services/apis/journalApi';
import type { CreateJournalEntryPayload } from '../../types/journal';

export default function EditJournalEntrypage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isLoading } = useJournalEntry(id!);
    const { mutate: updateEntry, isPending } = useUpdateJournalEntry();

    const journalEntry = data?.data?.journalEntry;

    const normalizeDate = (value: string) => {
        return value.includes('T') ? value.split('T')[0] : value;
    };

    const handleSubmit = (payload: CreateJournalEntryPayload) => {
        if (!id) return;

        updateEntry(
            { id, payload },
            {
                onSuccess: () => {
                    navigate('/journal-entries');
                },
            }
        );
    };

    const handleCancel = () => {
        navigate('/journal-entries');
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!journalEntry) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600">Journal entry not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title={`Edit Journal Entry ${journalEntry.entryNumber}`}
                subtitle="Update journal entry details"
            />

            <div className="bg-card rounded-lg border border-primary/10 p-4">
                <JournalEntryForm
                    initialData={{
                        entryNumber: journalEntry.entryNumber,
                        entryDate: normalizeDate(journalEntry.entryDate),
                        entryType:
                            journalEntry.entryType ||
                            (journalEntry.isAdjusting
                                ? 'adjusting'
                                : 'standard'),
                        isAdjusting: journalEntry.isAdjusting,
                        lines: journalEntry.lines.map((line, index) => ({
                            id: line.id,
                            accountId: line.accountId,
                            lineNumber: index + 1,
                            debit: line.debit,
                            credit: line.credit,
                            description: line.description,
                            memo: line.memo || line.description,
                            contactId: line.contactId || '',
                            taxId: line.taxId || '',
                        })),
                        description: journalEntry.memo,
                        memo: journalEntry.memo || '',
                        existingAttachments: journalEntry.attachments || [],
                    }}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isPending}
                />
            </div>
        </div>
    );
}
