import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useInviteUser } from '../../services/apis/usersApi';
import { Role } from '../../types';
import Button from '../typography/Button';
import { InputField, SelectField } from '../typography/InputFields';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    roles?: Role[];
}


const InviteUserModal = ({
    isOpen,
    onClose,
    roles = [],
}: InviteUserModalProps) => {
    const [formData, setFormData] = useState({
        email: '',
        roleId: '',
    });
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

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

        try {
            await inviteUser({
                email: formData.email,
                roleId: formData.roleId,
            });
            // Reset form on success
            setFormData({ email: '', roleId: '' });
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
                    {/* Enter email */}
                    <div>
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            Enter email address
                        </h3>
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
