export type Tax = {
    id: string;
    name: string;
    rate: number;
    code?: string;
    description?: string;
    isActive?: boolean;
};

export type TaxListResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: Tax[];
        pagination: {
            page: number;
            limit: number;
            offset: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    };
};

export type TaxResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: Tax;
};

export type TaxStatsResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        total: number;
        active: number;
        inactive: number;
    };
};

export type TaxFilters = {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    isActive?: boolean;
};
