import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useInviteUser } from '../../services/apis/usersApi';
import { Role } from '../../types';
import Popup from '../shared/Popup';
import { Button } from '../ui/button';
import Input from '../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

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
        name: '',
        email: '',
        roleId: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutateAsync: inviteUser, isPending } = useInviteUser();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
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

        try {
            await inviteUser({
                name: formData.name,
                email: formData.email,
                roleId: formData.roleId,
            });
            // Reset form on success
            setFormData({ name: '', email: '', roleId: '' });
            setErrors({});
            onClose();
        } catch (error) {
            // Error is handled by the mutation's onError
            console.error('Invite user error:', error);
        }
    };

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            title="Add user"
            size="2xl"
            loading={isPending}
            closeOnBackdropClick={false}
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        loading={isPending}
                        disabled={isPending}
                        form="invite-user-form"
                    >
                        Send invite
                    </Button>
                </div>
            }
        >
            <form
                id="invite-user-form"
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* User Information */}
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-4">
                        User Information
                    </h3>
                    <div className="flex flex-col gap-4">
                        {/* Name Field */}
                        <div>
                            <Input
                                id="user-name"
                                type="text"
                                value={formData.name}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
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
                                placeholder="John Doe"
                            />
                            {errors.name && (
                                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                                    <FaExclamationTriangle className="w-3 h-3" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <Input
                                id="user-email"
                                type="email"
                                value={formData.email}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
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
                                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                                    <FaExclamationTriangle className="w-3 h-3" />
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Select a role */}
                <div>
                    <Select
                        value={formData.roleId}
                        onValueChange={(value: string) => {
                            setFormData({ ...formData, roleId: value });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                    {role.displayName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.roleId && (
                        <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                            <FaExclamationTriangle className="w-3 h-3" />
                            {errors.roleId}
                        </p>
                    )}
                </div>
            </form>
        </Popup>
    );
};

export default InviteUserModal;
