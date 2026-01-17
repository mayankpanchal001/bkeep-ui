import { LockIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useChangePassword } from '../../services/apis/authApi';
import { Button } from '../ui/button';
import Input from '../ui/input';

type ChangePasswordModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { mutateAsync: changePassword, isPending: loading } = useChangePassword();
    const [error, setError] = useState('');
    useEffect(() => {
        if (isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setError('');
            /*         setSuccess(""); */
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            console.log('submitting password change ...');

            await changePassword({
                currentPassword,
                newPassword,
            });
            onClose();
        } catch (error: unknown) {
            const message =
                error &&
                typeof error === 'object' &&
                'response' in error &&
                error.response &&
                typeof error.response === 'object' &&
                'data' in error.response &&
                error.response.data &&
                typeof error.response.data === 'object' &&
                'message' in error.response.data &&
                typeof error.response.data.message === 'string'
                    ? error.response.data.message
                    : 'Failed to update password';
            setError(message);
        }
    };

    if (!isOpen) return null;

    return (
        // 1. Overlay (Dark background)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            {/* 2. Modal Container */}
            <div className="w-full max-w-md rounded bg-card p-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-primary">
                        Change Password
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-primary/50 hover:text-primary transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="current-password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <Input
                        id="new-password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    <Input
                        id="confirm-password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            startIcon={<XIcon className="w-4 h-4" />}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            loading={loading}
                            disabled={loading}
                            startIcon={<LockIcon className="w-4 h-4" />}
                        >
                            Update Password
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
