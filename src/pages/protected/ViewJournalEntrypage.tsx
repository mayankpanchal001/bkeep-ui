import { useParams } from 'react-router';
import { Column, DataTable } from '../../components/shared/DataTable';
import Loading from '../../components/shared/Loading';
import PageHeader from '../../components/shared/PageHeader';
import { useJournalEntry } from '../../services/apis/journalApi';
import { JournalEntryLine } from '../../types/journal';

export default function ViewJournalEntrypage() {
    const { id } = useParams<{ id: string }>();
    const { data, isLoading } = useJournalEntry(id!);

    const journalEntry = data?.data?.journalEntry;

    const columns: Column<JournalEntryLine>[] = [
        {
            header: '#',
            accessorKey: 'lineNumber',
            className: 'w-16 text-primary-50',
        },
        {
            header: 'Account',
            accessorKey: 'accountName',
            cell: (line) => (
                <div>
                    <div className="font-medium text-primary">
                        {line.accountName}
                    </div>
                    {line.name && (
                        <div className="text-xs text-primary-50">
                            {line.name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: (line) => (
                <div className="text-primary-75">
                    {line.description}
                    {line.memo && line.memo !== line.description && (
                        <div className="text-xs text-primary-50 mt-0.5">
                            Memo: {line.memo}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Debit',
            accessorKey: 'debit',
            className: 'text-right font-medium text-primary',
            cell: (line) => `$${line.debit.toFixed(2)}`,
        },
        {
            header: 'Credit',
            accessorKey: 'credit',
            className: 'text-right font-medium text-primary',
            cell: (line) => `$${line.credit.toFixed(2)}`,
        },
    ];

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

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
            posted: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                label: 'Posted',
            },
            voided: { bg: 'bg-red-100', text: 'text-red-700', label: 'Voided' },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig.draft;

        return (
            <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title={`Journal Entry ${journalEntry.journalNo}`}
                subtitle={new Date(
                    journalEntry.journalDate
                ).toLocaleDateString()}
            />

            {/* Status and Details */}
            <div className="bg-white rounded-lg border border-primary-10 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-primary-50 mb-1">
                            Status
                        </label>
                        {getStatusBadge(journalEntry.status)}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary-50 mb-1">
                            Journal No.
                        </label>
                        <p className="text-primary font-medium">
                            {journalEntry.journalNo}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary-50 mb-1">
                            Date
                        </label>
                        <p className="text-primary font-medium">
                            {new Date(
                                journalEntry.journalDate
                            ).toLocaleDateString()}
                        </p>
                    </div>
                    {journalEntry.isAdjusting && (
                        <div>
                            <label className="block text-sm font-medium text-primary-50 mb-1">
                                Type
                            </label>
                            <p className="text-blue-600 font-medium">
                                Adjusting Entry
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Journal Lines */}
            <div className="bg-white rounded-lg border border-primary-10 overflow-hidden">
                <div className="px-4 py-2 border-b border-primary-10">
                    <h3 className="text-base font-semibold text-primary">
                        Journal Lines
                    </h3>
                </div>
                <DataTable
                    data={journalEntry.lines}
                    columns={columns}
                    containerClassName="border-none rounded-none"
                    tableClassName="w-full"
                    footerContent={
                        <tr className="bg-gray-50 border-t border-primary-10">
                            <td
                                colSpan={3}
                                className="px-3 py-2 text-right font-semibold text-sm text-primary"
                            >
                                Total
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                ${journalEntry.totalDebit.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-sm text-primary">
                                ${journalEntry.totalCredit.toFixed(2)}
                            </td>
                        </tr>
                    }
                />
            </div>

            {/* Memo */}
            {journalEntry.memo && (
                <div className="bg-white rounded-lg border border-primary-10 p-3">
                    <h3 className="text-sm font-medium text-primary mb-1">
                        Memo
                    </h3>
                    <p className="text-sm text-primary-75 whitespace-pre-wrap">
                        {journalEntry.memo}
                    </p>
                </div>
            )}

            {/* Attachments */}
            {journalEntry.attachments &&
                journalEntry.attachments.length > 0 && (
                    <div className="bg-white rounded-lg border border-primary-10 p-3">
                        <h3 className="text-sm font-medium text-primary mb-2">
                            Attachments
                        </h3>
                        <div className="space-y-2">
                            {journalEntry.attachments.map(
                                (attachment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 border border-primary-10 rounded-lg"
                                    >
                                        <span className="text-sm text-primary">
                                            {attachment}
                                        </span>
                                        <a
                                            href={attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Download
                                        </a>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
}
