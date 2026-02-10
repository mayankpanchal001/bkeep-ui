import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Button } from '../ui/button';

type ConfirmationDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'danger';
    loading?: boolean;
    showCloseButton?: boolean;
};

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false,
    showCloseButton = true,
}: ConfirmationDialogProps) => {
    // Handle ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, loading]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-sm rounded bg-card p-4 border border-primary/10">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-primary">
                        {title}
                    </h3>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-primary/50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Close"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <p className="mt-2 text-sm text-primary/75">{message}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button onClick={onConfirm} disabled={loading}>
                        {loading ? 'Processing...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
