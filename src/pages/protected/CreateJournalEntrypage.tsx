import { useNavigate } from 'react-router';
import { useCreateJournalEntry } from '../../services/apis/journalApi';
import type { CreateJournalEntryPayload } from '../../types/journal';
import { JournalEntryForm } from '/src/components/journal/JournalEntryForm';
import PageHeader from '/src/components/shared/PageHeader';

export default function CreateJournalEntrypage() {
    const navigate = useNavigate();
    const { mutate: createEntry, isPending } = useCreateJournalEntry();

    const handleSubmit = (data: CreateJournalEntryPayload) => {
        createEntry(data, {
            onSuccess: () => {
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

            <div className="bg-white rounded-lg border border-primary/10 p-4">
                <JournalEntryForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isPending}
                />
            </div>
        </div>
    );
}
