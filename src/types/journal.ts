/**
 * Journal Entry Types
 */

export type JournalEntryLine = {
    id: string;
    accountName?: string;
    name?: string;
    accountId: string;
    account?: {
        id: string;
        accountNumber?: string;
        accountName?: string;
        accountType?: string;
    };
    lineNumber: number;
    debit: number | string;
    credit: number | string;
    description: string;
    memo?: string;
    contactId?: string;
    taxId?: string;
};

export type CreateJournalEntryLine = Omit<
    JournalEntryLine,
    'id'
> & {
    id?: string;
    contactId?: string;
    taxId?: string;
};

export type JournalEntry = {
    id: string;
    entryNumber: string;
    entryDate: string;
    entryType?: 'standard' | 'adjusting' | 'closing' | 'reversing';
    isAdjusting: boolean;
    isClosing?: boolean;
    isReversing?: boolean;
    reversalDate?: string | null;
    reference?: string | null;
    lines: JournalEntryLine[];
    memo?: string;
    attachments?: string[];
    status: 'draft' | 'posted' | 'voided';
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    totalDebit: number | string;
    totalCredit: number | string;
    sourceModule?: string | null;
    sourceId?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    postedBy?: string | null;
    postedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    tenantId?: string;
};

export type CreateJournalEntryPayload = {
    entryNumber?: string;
    entryDate: string;
    entryType?: 'standard' | 'adjusting' | 'closing' | 'reversing';
    isAdjusting: boolean;
    isClosing?: boolean;
    isReversing?: boolean;
    reversalDate?: string | null;
    description?: string;
    reference?: string;
    memo?: string;
    currency?: string;
    exchangeRate?: number;
    sourceModule?: string;
    sourceId?: string;
    lines: CreateJournalEntryLine[];
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
