export type TemplateType = 'chart_of_accounts' | 'tax';

export type TemplateListType = 'accounts' | 'tax';

export type Template = {
    id: string;
    description?: string;
    isActive: boolean;
    name: string;
    templateData: unknown;
    templateType: TemplateType;
    createdAt: string;
    updatedAt: string;
};

export type TemplateFilters = {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    type?: TemplateListType | TemplateType;
    isActive?: boolean;
};

export type TemplateListResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        items: Template[];
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    };
};

export type TemplateResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: Template;
};
