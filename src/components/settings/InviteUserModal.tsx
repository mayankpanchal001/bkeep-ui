import { useEffect, useState } from 'react';
import {
    FaChevronDown,
    FaChevronUp,
    FaExclamationTriangle,
    FaTimes,
} from 'react-icons/fa';
import { useInviteUser } from '../../services/apis/usersApi';
import { PermissionCategory, Role } from '../../types';
import Button from '../typography/Button';
import { InputField, SelectField } from '../typography/InputFields';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    roles?: Role[];
    permissionCategories?: PermissionCategory[];
}

// Mock roles - replace with API call
const MOCK_ROLES: Role[] = [
    {
        id: '1',
        name: 'standard_all_access',
        displayName: 'Standard all access',
    },
    { id: '2', name: 'standard_no_access', displayName: 'Standard no access' },
    { id: '3', name: 'ar_manager', displayName: 'Accounts receivable manager' },
    { id: '4', name: 'ap_manager', displayName: 'Accounts payable manager' },
    {
        id: '5',
        name: 'standard_limited',
        displayName: 'Standard limited customers and suppliers',
    },
    {
        id: '6',
        name: 'in_house_accountant',
        displayName: 'In house accountant',
    },
    { id: '7', name: 'company_admin', displayName: 'Company admin' },
];

// Mock permissions - replace with API call
const MOCK_PERMISSIONS: PermissionCategory[] = [
    {
        name: 'Sales',
        permissions: [
            {
                id: 'sales_invoices',
                name: 'invoices',
                displayName: 'Invoices',
                access: 'no',
            },
            {
                id: 'sales_estimates',
                name: 'estimates',
                displayName: 'Estimates',
                access: 'no',
            },
            {
                id: 'sales_receipts',
                name: 'sales_receipt',
                displayName: 'Sales receipt',
                access: 'no',
            },
            {
                id: 'sales_payments',
                name: 'receive_payments',
                displayName: 'Receive payments',
                access: 'no',
            },
            {
                id: 'sales_credit',
                name: 'credit_memo',
                displayName: 'Credit memo',
                access: 'no',
            },
            {
                id: 'sales_refund',
                name: 'refund_receipt',
                displayName: 'Refund receipt',
                access: 'no',
            },
            {
                id: 'sales_delayed_credit',
                name: 'delayed_credit',
                displayName: 'Delayed credit',
                access: 'no',
            },
            {
                id: 'sales_delayed_charge',
                name: 'delayed_charge',
                displayName: 'Delayed charge',
                access: 'no',
            },
        ],
    },
];

const InviteUserModal = ({
    isOpen,
    onClose,
    roles = MOCK_ROLES,
    permissionCategories = MOCK_PERMISSIONS,
}: InviteUserModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roleId: '',
    });
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set()
    );
    const [permissions, setPermissions] = useState<
        Record<string, 'full' | 'view' | 'no'>
    >({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutateAsync: inviteUser, isPending } = useInviteUser();

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

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isPending) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, isPending]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isPending) {
            onClose();
        }
    };

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    const handlePermissionChange = (
        permissionId: string,
        access: 'full' | 'view' | 'no'
    ) => {
        setPermissions((prev) => ({
            ...prev,
            [permissionId]: access,
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.roleId) {
            newErrors.roleId = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const selectedPermissions = Object.entries(permissions)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, access]) => access !== 'no')
            .map(([permissionId]) => permissionId);

        try {
            await inviteUser({
                name: formData.name,
                email: formData.email,
                roleId: formData.roleId,
                permissions: selectedPermissions,
            });
            // Reset form on success
            setFormData({ name: '', email: '', roleId: '' });
            setPermissions({});
            setErrors({});
            onClose();
        } catch (error) {
            // Error is handled by the mutation's onError
            console.error('Invite user error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-primary">
                        Add user
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="text-primary-50 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Enter personal info */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            Enter personal info
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputField
                                    id="user-name"
                                    label="Name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        });
                                        if (errors.name) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                name: '',
                                            }));
                                        }
                                    }}
                                    required
                                    placeholder="Enter full name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <FaExclamationTriangle className="w-3 h-3" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <InputField
                                    id="user-email"
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        });
                                        if (errors.email) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                email: '',
                                            }));
                                        }
                                    }}
                                    required
                                    placeholder="user@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <FaExclamationTriangle className="w-3 h-3" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Select a role */}
                    <div>
                        <SelectField
                            id="user-role"
                            label="Select a role"
                            value={formData.roleId}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    roleId: e.target.value,
                                });
                                if (errors.roleId) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        roleId: '',
                                    }));
                                }
                            }}
                            required
                            options={roles.map((role) => ({
                                value: role.id,
                                label: role.displayName,
                            }))}
                        />
                        {errors.roleId && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <FaExclamationTriangle className="w-3 h-3" />
                                {errors.roleId}
                            </p>
                        )}
                    </div>

                    {/* Permissions */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-primary">
                                Permissions
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    const allExpanded =
                                        permissionCategories.every((cat) =>
                                            expandedCategories.has(cat.name)
                                        );
                                    if (allExpanded) {
                                        setExpandedCategories(new Set());
                                    } else {
                                        setExpandedCategories(
                                            new Set(
                                                permissionCategories.map(
                                                    (cat) => cat.name
                                                )
                                            )
                                        );
                                    }
                                }}
                                className="text-sm text-primary-75 hover:text-primary transition-colors"
                            >
                                {expandedCategories.size ===
                                permissionCategories.length
                                    ? 'View less permissions'
                                    : 'View all permissions'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {permissionCategories.map((category) => {
                                const isExpanded = expandedCategories.has(
                                    category.name
                                );
                                return (
                                    <div
                                        key={category.name}
                                        className="border border-primary-10 rounded-xl overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleCategory(category.name)
                                            }
                                            className="w-full flex items-center justify-between p-4 hover:bg-primary-5 transition-colors"
                                        >
                                            <span className="font-medium text-primary">
                                                {category.name}
                                            </span>
                                            {isExpanded ? (
                                                <FaChevronUp className="w-4 h-4 text-primary-50" />
                                            ) : (
                                                <FaChevronDown className="w-4 h-4 text-primary-50" />
                                            )}
                                        </button>

                                        {isExpanded && (
                                            <div className="p-4 pt-0 space-y-3 border-t border-primary-10">
                                                {category.permissions.map(
                                                    (permission) => {
                                                        const currentAccess =
                                                            permissions[
                                                                permission.id
                                                            ] ||
                                                            permission.access;
                                                        return (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex items-center justify-between"
                                                            >
                                                                <span className="text-sm text-primary-75">
                                                                    {
                                                                        permission.displayName
                                                                    }
                                                                </span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handlePermissionChange(
                                                                                permission.id,
                                                                                'full'
                                                                            )
                                                                        }
                                                                        className={`px-3 py-1 text-xs rounded transition-colors ${
                                                                            currentAccess ===
                                                                            'full'
                                                                                ? 'bg-primary text-white'
                                                                                : 'bg-primary-10 text-primary-75 hover:bg-primary-20'
                                                                        }`}
                                                                    >
                                                                        Full
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handlePermissionChange(
                                                                                permission.id,
                                                                                'view'
                                                                            )
                                                                        }
                                                                        className={`px-3 py-1 text-xs rounded transition-colors ${
                                                                            currentAccess ===
                                                                            'view'
                                                                                ? 'bg-primary text-white'
                                                                                : 'bg-primary-10 text-primary-75 hover:bg-primary-20'
                                                                        }`}
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handlePermissionChange(
                                                                                permission.id,
                                                                                'no'
                                                                            )
                                                                        }
                                                                        className={`px-3 py-1 text-xs rounded transition-colors ${
                                                                            currentAccess ===
                                                                            'no'
                                                                                ? 'bg-red-100 text-red-700'
                                                                                : 'bg-primary-10 text-primary-75 hover:bg-primary-20'
                                                                        }`}
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-primary-10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={isPending}
                            disabled={isPending}
                        >
                            Send invite
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteUserModal;
