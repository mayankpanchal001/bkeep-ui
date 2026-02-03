import axiosInstance from '../axiosClient';

export interface UploadAttachmentResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        id: string;
        storageKey: string;
        filename: string;
        mimeType: string;
        size: number;
        description?: string;
        createdAt: string;
        updatedAt: string;
    };
}

/**
 * Upload a single attachment file
 */
export async function uploadAttachment(
    file: File,
    options?: {
        entityType?: string;
        entityId?: string;
        description?: string;
        tag?: string;
    }
): Promise<UploadAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.entityType) formData.append('entityType', options.entityType);
    if (options?.entityId) formData.append('entityId', options.entityId);
    if (options?.description)
        formData.append('description', options.description);
    if (options?.tag) formData.append('tag', options.tag);

    const response = await axiosInstance.post('/attachments/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}
