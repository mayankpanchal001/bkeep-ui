import React, { useState } from 'react';
import { useLogin } from '../../services/apis/authApi';

import { showErrorToast } from '../../utills/toast';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
    const {
        mutateAsync: login,
        isPending: isLoading,
        error: loginError,
    } = useLogin();

    const validateForm = () => {
        const errors: { email?: string; password?: string } = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.email = 'Email address is required';
        } else if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address.';
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            await login({ email, password });
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

    return (
        <div className="space-y-6">
            {/* Simple Spacing */}
            <div className="pt-2"></div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <InputField
                        id="login-email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email)
                                setFieldErrors({
                                    ...fieldErrors,
                                    email: undefined,
                                });
                        }}
                        error={fieldErrors.email}
                        required
                        icon={undefined}
                    />
                    <InputField
                        id="login-password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password)
                                setFieldErrors({
                                    ...fieldErrors,
                                    password: undefined,
                                });
                        }}
                        error={fieldErrors.password}
                        required
                        icon={undefined}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="remember-me"
                        type="checkbox"
                        className="h-3.5 w-3.5 text-black border-gray-300 rounded focus:ring-black cursor-pointer accent-black"
                    />
                    <label
                        htmlFor="remember-me"
                        className="text-[12.5px] font-medium text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
                    >
                        Remember me for 30 days
                    </label>
                </div>

                {error && (
                    <div className="border border-red-100 bg-red-50/50 p-2.5 rounded-lg">
                        <p className="text-[12px] text-center text-red-600 font-semibold tracking-tight">
                            {error}
                        </p>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full !rounded-md !normal-case h-9 text-sm font-semibold"
                    loading={isLoading}
                    disabled={isLoading}
                >
                    Login
                </Button>
            </form>
        </div>
    );
}
