export type ContactType = 'supplier' | 'customer';

export type ContactAddress = {
    streetAddress1?: string | null;
    streetAddress2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
};

export type Contact = {
    id: string;
    type: ContactType;
    companyName?: string | null;
    displayName: string;
    title?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    nameOnCheques?: string | null;
    defaultAccountId?: string | null;
    defaultTaxId?: string | null;
    openingBalance?: number | null;
    openingBalanceDate?: string | null;
    isActive: boolean;
    notes?: string | null;
    billingAddress?: ContactAddress | null;
    shippingAddress?: ContactAddress | null;
    createdAt: string;
    updatedAt: string;
};

export type ContactsQueryParams = {
    page?: number;
    limit?: number;
    search?: string;
    type?: ContactType;
    isActive?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
};

export type CreateContactPayload = {
    type: ContactType;
    displayName: string;
    companyName?: string | null;
    title?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    nameOnCheques?: string | null;
    defaultAccountId?: string | null;
    defaultTaxId?: string | null;
    openingBalance?: number | null;
    openingBalanceDate?: string | null;
    notes?: string | null;
    billingAddress?: ContactAddress | null;
    shippingAddress?: ContactAddress | null;
};

export type UpdateContactPayload = Partial<CreateContactPayload>;

export type PaginationInfo = {
    page: number;
    limit: number;
    offset: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type ContactsListResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: {
        items: Contact[];
        pagination?: PaginationInfo;
    };
};

export type ContactResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: Contact;
};

export type ImportField = {
    key: string;
    label: string;
    required: boolean;
};

export type ImportFieldsResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: ImportField[];
};

