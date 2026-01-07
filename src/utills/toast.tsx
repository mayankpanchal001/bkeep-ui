import { toast } from 'sonner';

export type ToastId = string | number;

export const showSuccessToast = (message: string) => {
    toast.success(message);
};

export const showErrorToast = (message: string) => {
    toast.error(message);
};

export const showLoadingToast = (message: string) => {
    return toast.loading(message);
};

export const dismissToast = (toastId?: ToastId) => {
    toast.dismiss(toastId);
};

export const updateToast = (
    toastId: ToastId,
    type: 'success' | 'error',
    message: string
) => {
    toast[type](message, { id: toastId });
};
