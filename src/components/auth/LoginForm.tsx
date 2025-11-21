import React, { useState } from 'react';
import { FaLock, FaTimes, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { useForgotPassword, useLogin } from '../../services/apis/authApi';

import { showErrorToast, showSuccessToast } from '../../utills/toast';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const navigate = useNavigate();
    const {
        mutateAsync: login,
        isPending: isLoading,
        error: loginError,
    } = useLogin();
    const { mutateAsync: forgotPassword, isPending: isForgotPasswordLoading } =
        useForgotPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err: unknown) {
            let message = 'Invalid email or password';
            showErrorToast(message);

            if (err && typeof err === 'object' && 'response' in err) {
                const response = (
                    err as { response?: { data?: { message?: string } } }
                ).response;
                message = response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            } else if (loginError instanceof Error) {
                message = loginError.message;
            }

            setError(message);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotPasswordEmail) {
            showErrorToast('Please enter your email address');
            return;
        }

        try {
            await forgotPassword(forgotPasswordEmail);
            showSuccessToast(
                'Password reset link has been sent to your email address'
            );
            setShowForgotPassword(false);
            setForgotPasswordEmail('');
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
            showErrorToast(message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-primary">
                                Forgot Password?
                            </h3>
                            <button
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotPasswordEmail('');
                                }}
                                className="text-primary-50 hover:text-primary transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-primary-75 mb-6">
                            Enter your email address and we'll send you a link
                            to reset your password.
                        </p>
                        <form
                            onSubmit={handleForgotPassword}
                            className="space-y-4"
                        >
                            <InputField
                                id="forgot-password-email"
                                label="Email ID"
                                type="email"
                                placeholder="Enter your email address"
                                value={forgotPasswordEmail}
                                onChange={(e) =>
                                    setForgotPasswordEmail(e.target.value)
                                }
                                required
                                icon={<FaUser className="w-4 h-4" />}
                            />
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setForgotPasswordEmail('');
                                    }}
                                    disabled={isForgotPasswordLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    loading={isForgotPasswordLoading}
                                    disabled={isForgotPasswordLoading}
                                >
                                    Send Reset Link
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <InputField
                        id="login-email"
                        label="Email ID"
                        type="email"
                        placeholder="abc@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={<FaUser className="w-4 h-4" />}
                    />
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="login-password"
                                className="text-sm font-medium text-primary"
                            >
                                Password
                            </label>
                        </div>
                        <InputField
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            icon={<FaLock className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {error && (
                    <div className="border border-red-300 bg-red-50 p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-center text-red-700 font-medium">
                            {error}
                        </p>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Sign In
                </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary-25"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-primary-50">
                        Or if you forgot your password
                    </span>
                </div>
            </div>
            <div className="flex justify-center ">
                <button
                    type="button"
                    onClick={() => {
                        setForgotPasswordEmail(email);
                        setShowForgotPassword(true);
                    }}
                    className="text-sm  text-primary hover:text-primary-75 transition-colors cursor-pointer"
                >
                    Forgot Password?
                </button>
            </div>

            <div className="text-center pt-2">
                <p className="text-xs text-primary-50">
                    Secure login powered by our system
                </p>
            </div>
        </div>
    );
}
