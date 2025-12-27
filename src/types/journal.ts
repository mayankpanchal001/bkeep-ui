/**
 * Journal Entry Types
 */

export type JournalEntryLine = {
    id: number;
    accountName: string;
    name: string;
    accountId: string;
    lineNumber: number;
    debit: number;
    credit: number;
    description: string;
    memo?: string;
};

export type CreateJournalEntryLine = Omit<
    JournalEntryLine,
    'id' | 'accountName' | 'name'
> & {
    id?: number; // Optional for new lines or updates
    accountName?: string; // Optional for display
    name?: string; // Optional for display
};

export type JournalEntry = {
    id: string;
    journalNo: string;
    journalDate: string;
    isAdjusting: boolean;
    lines: JournalEntryLine[];
    memo?: string;
    attachments?: string[];
    status: 'draft' | 'posted' | 'voided';
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    totalDebit: number;
    totalCredit: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    tenantId?: string;
};

export type CreateJournalEntryPayload = {
    journalNo?: string;
    journalDate: string;
    entryType?: 'standard' | 'adjusting' | 'closing' | 'reversing';
    isAdjusting: boolean;
    isClosing?: boolean;
    isReversing?: boolean;
    reversalDate?: string | null;
    memo?: string;
    reference?: string;
    sourceModule?: string;
    sourceId?: string;
    lines: CreateJournalEntryLine[];
    attachments?: File[];
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
};

export type UpdateJournalEntryPayload = Partial<CreateJournalEntryPayload>;

export type JournalEntriesListResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        journalEntries: JournalEntry[];
        total: number;
        page: number;
        limit: number;
    };
};

export type JournalEntryResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        journalEntry: JournalEntry;
    };
};

export type JournalEntryFilters = {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'draft' | 'posted' | 'voided';
    startDate?: string;
    endDate?: string;
    isAdjusting?: boolean;
};
