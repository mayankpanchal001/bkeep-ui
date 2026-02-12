import { PaginationInfo } from './index';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'voided';

export interface InvoiceLine {
    id: string;
    lineNumber: number;
    productService: string;
    description: string;
    quantity: string;
    rate: string;
    amount: number;
    taxId: string;
    taxAmount: number;
}

export interface Invoice {
    id: string;
    status: InvoiceStatus;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    terms?: string;
    customer: {
        id: string;
        displayName: string;
        email?: string;
        phoneNumber?: string;
    };
    clientName?: string; // alias for customer.displayName for table sorting
    customerName?: string; // alias for customer.displayName
    billingAddress?: string;
    customerEmail?: string;
    messageOnInvoice?: string;
    statementMessage?: string;
    sendLater: boolean;
    onlinePaymentsEnabled: boolean;
    subtotalAmount: number;
    taxAmount: number;
    totalAmount: number;
    amount: number; // alias for totalAmount for table
    balanceRemaining: number;
    isTaxInclusive: boolean;
    lines: InvoiceLine[];
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceLinePayload {
    productService: string;
    description?: string;
    quantity: number;
    rate: number;
    taxId?: string;
}

export interface CreateInvoicePayload {
    customerId: string;
    billingAddress?: string;
    customerEmail?: string;
    invoiceDate: string;
    dueDate: string;
    terms?: string;
    invoiceNumber?: string;
    messageOnInvoice?: string;
    statementMessage?: string;
    sendLater?: boolean;
    onlinePaymentsEnabled?: boolean;
    isTaxInclusive?: boolean;
    lines: InvoiceLinePayload[];
}

export interface InvoiceListResponse {
    data: {
        items: Invoice[];
        pagination: PaginationInfo;
    };
    message?: string;
    success?: boolean;
}

export interface InvoiceResponse {
    data: Invoice;
    message?: string;
    success?: boolean;
}

export interface InvoiceQueryParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sort?: string; // alias for sortBy
    sortOrder?: 'asc' | 'desc';
    order?: 'asc' | 'desc'; // alias for sortOrder
}
