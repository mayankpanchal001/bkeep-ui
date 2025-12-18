import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaFileAlt, FaTimes } from 'react-icons/fa';

type AddNewOption = {
    id: string;
    label: string;
    path: string;
    hasIcon?: boolean;
};

const ADD_NEW_OPTIONS: AddNewOption[] = [
    {
        id: 'accounts-payable-aging-summary',
        label: 'Accounts payable aging summary',
        path: '/reports',
        hasIcon: true,
    },
    {
        id: 'accounts-payable-aging-detail',
        label: 'Accounts payable aging detail',
        path: '/reports',
        hasIcon: true,
    },
    {
        id: 'accounts-receivable-aging-summary',
        label: 'Accounts receivable aging summary',
        path: '/reports',
        hasIcon: true,
    },
    {
        id: 'accounts-receivable-aging-detail',
        label: 'Accounts receivable aging detail',
        path: '/reports',
        hasIcon: true,
    },
    {
        id: 'balance-sheet',
        label: 'Balance Sheet',
        path: '/reports/balance-sheet',
        hasIcon: false,
    },
    {
        id: 'statement-of-cash-flows',
        label: 'Statement of Cash Flows',
        path: '/reports',
        hasIcon: true,
    },
    {
        id: 'general-ledger',
        label: 'General Ledger',
        path: '/transactions',
        hasIcon: false,
    },
    {
        id: 'profit-and-loss',
        label: 'Profit and Loss',
        path: '/reports/income-statement',
        hasIcon: false,
    },
    {
        id: 'unpaid-bills',
        label: 'Unpaid Bills',
        path: '/invoices',
        hasIcon: true,
    },
];

type AddNewModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const AddNewModal = ({ isOpen, onClose }: AddNewModalProps) => {
    const navigate = useNavigate();

    // Handle ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
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
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleOptionClick = (path: string) => {
        navigate(path);
        onClose();
    };

    // Split options into two columns
    const leftColumn = ADD_NEW_OPTIONS.slice(
        0,
        Math.ceil(ADD_NEW_OPTIONS.length / 2)
    );
    const rightColumn = ADD_NEW_OPTIONS.slice(
        Math.ceil(ADD_NEW_OPTIONS.length / 2)
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-primary">
                        Add New
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-primary-50 hover:text-primary transition-colors"
                        aria-label="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-primary-10">
                    {/* Left Column */}
                    <div className="divide-y divide-primary-10">
                        {leftColumn.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionClick(option.path)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary-10 transition-colors group"
                            >
                                {option.hasIcon && (
                                    <FaFileAlt className="w-4 h-4 text-primary-50 group-hover:text-primary transition-colors flex-shrink-0" />
                                )}
                                <span className="text-sm text-primary-75 group-hover:text-primary transition-colors">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                    {/* Right Column */}
                    <div className="divide-y divide-primary-10 border-l border-primary-10 md:border-l">
                        {rightColumn.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionClick(option.path)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary-10 transition-colors group"
                            >
                                {option.hasIcon && (
                                    <FaFileAlt className="w-4 h-4 text-primary-50 group-hover:text-primary transition-colors flex-shrink-0" />
                                )}
                                <span className="text-sm text-primary-75 group-hover:text-primary transition-colors">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewModal;
