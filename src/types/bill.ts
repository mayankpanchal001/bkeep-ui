/** API-accepted status values for filtering and response */
export type BillStatus =
    | 'draft'
    | 'open'
    | 'partially_paid'
    | 'paid'
    | 'voided';

export type Bill = {
    id: string;
    supplierId: string;
    supplierName: string;
    dueDate: string;
    billDate?: string;
    billAmount: number;
    openBalance: number;
    status: BillStatus;
    currency?: string;
    createdAt?: string;
    updatedAt?: string;
};

/** API-allowed sort field for list bills */
export type BillSortField =
    | 'documentDate'
    | 'dueDate'
    | 'totalAmount'
    | 'createdAt'
    | 'updatedAt';

export type BillsQueryParams = {
    page?: number;
    limit?: number;
    status?: BillStatus;
    supplierId?: string;
    billDateFrom?: string;
    billDateTo?: string;
    sort?: BillSortField;
    order?: 'asc' | 'desc';
};

export type PaginationInfo = {
    page: number;
    limit: number;
    offset: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type BillsListResponse = {
    data: {
        items: Bill[];
        pagination: PaginationInfo;
        totals?: {
            billAmount: number;
            openBalance: number;
        };
    };
    message?: string;
};

export type BillResponse = {
    data: Bill;
    message?: string;
};

export type CreateBillPayload = {
    supplierId: string;
    billDate: string;
    dueDate: string;
    amount: number;
    currency?: string;
    description?: string;
    billNo?: string;
    terms?: string;
    mailingAddress?: string;
    memo?: string;
    lineItems?: Array<{
        description: string;
        amount: number;
        accountId?: string;
    }>;
};

export type RecordBillPaymentPayload = {
    amount: number;
    paymentDate: string;
    reference?: string;
    accountId?: string;
};
