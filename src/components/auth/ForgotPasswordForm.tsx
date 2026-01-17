import { LogIn } from 'lucide-react';
import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import { useForgotPassword } from '../../services/apis/authApi';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import Input from '../ui/input';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { mutateAsync: forgotPassword, isPending: isForgotPasswordLoading } =
        useForgotPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            showErrorToast('Please enter your email address');
            return;
        }

        try {
            await forgotPassword(email);
            showSuccessToast(
                'Password reset link has been sent to your email address'
            );
            // Optionally redirect to login after a delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: unknown) {
            let message = 'Failed to send password reset email';
            if (err && typeof err === 'object' && 'response' in err) {
                const response = (
                    err as { response?: { data?: { message?: string } } }
                ).response;
                message = response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            showErrorToast(message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">
                    Forgot Password?
                </h2>
                <p className="text-sm text-primary/50">
                    Enter your email address and we'll send you a link to reset
                    your password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <Input
                        id="forgot-password-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
                        }
                        required
                        startIcon={<FaUser className="w-4 h-4" />}
                    />
                </div>

                {error && (
                    <div className="border border-red-300 bg-red-50 p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-balance text-center text-red-700 font-medium">
                            {error}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        variant="default"
                        className="w-full"
                        loading={isForgotPasswordLoading}
                        disabled={isForgotPasswordLoading}
                        startIcon={<Icons.Send className="w-4 h-4" />}
                    >
                        Send Reset Link
                    </Button>
                    <Link to="/login">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={isForgotPasswordLoading}
                            startIcon={<LogIn className="w-4 h-4" />}
                        >
                            Back to Login
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
