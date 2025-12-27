import { ReactNode, useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export type OffcanvasPosition = 'left' | 'right' | 'top' | 'bottom';

export interface OffcanvasProps {
    /** Whether the offcanvas is open */
    isOpen: boolean;
    /** Callback when offcanvas should close */
    onClose: () => void;
    /** Content to display in the offcanvas */
    children: ReactNode;
    /** Position of the offcanvas */
    position?: OffcanvasPosition;
    /** Optional title to display in the header */
    title?: ReactNode;
    /** Whether to show the close button */
    showCloseButton?: boolean;
    /** Whether to show the backdrop */
    backdrop?: boolean;
    /** Whether to close on backdrop click */
    closeOnBackdropClick?: boolean;
    /** Whether to close on ESC key press */
    closeOnEscape?: boolean;
    /** Custom className for the offcanvas container */
    className?: string;
    /** Custom className for the body content */
    bodyClassName?: string;
    /** Width of the offcanvas (for left/right positions). Default: 'w-80' */
    width?: string;
    /** Height of the offcanvas (for top/bottom positions). Default: 'h-80' */
    height?: string;
}

const POSITION_CLASSES: Record<OffcanvasPosition, string> = {
    left: 'left-0 top-0 bottom-0 border-r border-primary-10',
    right: 'right-0 top-0 bottom-0 border-l border-primary-10',
    top: 'top-0 left-0 right-0 border-b border-primary-10',
    bottom: 'bottom-0 left-0 right-0 border-t border-primary-10',
};

const TRANSITION_CLASSES: Record<
    OffcanvasPosition,
    { enter: string; leave: string }
> = {
    left: { enter: 'translate-x-0', leave: '-translate-x-full' },
    right: { enter: 'translate-x-0', leave: 'translate-x-full' },
    top: { enter: 'translate-y-0', leave: '-translate-y-full' },
    bottom: { enter: 'translate-y-0', leave: 'translate-y-full' },
};

const Offcanvas = ({
    isOpen,
    onClose,
    children,
    position = 'right',
    title,
    showCloseButton = true,
    backdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    className = '',
    bodyClassName = '',
    width = 'w-96',
    height = 'h-96',
}: OffcanvasProps) => {
    const [isVisible, setIsVisible] = useState(isOpen);

    // Sync internal state with prop for animation purposes
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle ESC key press
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, closeOnEscape, onClose]);

    // Prevent body scroll when offcanvas is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && closeOnBackdropClick) {
            onClose();
        }
    };

    if (!isVisible && !isOpen) return null;

    const isHorizontal = position === 'left' || position === 'right';
    const sizeClass = isHorizontal ? width : height;

    // Determine classes for transition
    const transformClass = isOpen
        ? TRANSITION_CLASSES[position].enter
        : TRANSITION_CLASSES[position].leave;

    return (
        <div
            className="fixed inset-0 z-50 flex"
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
            {/* Backdrop */}
            {backdrop && (
                <div
                    className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
                        isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                />
            )}

            {/* Offcanvas Panel */}
            <div
                className={`
                    fixed bg-white dark:bg-lightBg shadow-2xl transition-transform duration-300 ease-in-out
                    flex flex-col
                    ${POSITION_CLASSES[position]}
                    ${sizeClass}
                    ${transformClass}
                    ${className}
                `}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-primary-10">
                        <div className="text-xl font-semibold text-primary">
                            {title}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-primary-50 hover:text-primary rounded-full hover:bg-primary-10 transition-colors"
                                aria-label="Close"
                            >
                                <FaTimes size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className={`flex-1 overflow-y-auto p-4 ${bodyClassName}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Offcanvas;
