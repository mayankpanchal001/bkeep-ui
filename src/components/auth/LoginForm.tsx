import React, { useState } from 'react';
import { useLogin } from '../../services/apis/authApi';

import { showErrorToast } from '../../utills/toast';

import { LogIn } from 'lucide-react';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import Input from '../ui/input';

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
                    <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email)
                                setFieldErrors({
                                    ...fieldErrors,
                                    email: undefined,
                                });
                        }}
                        error={!!fieldErrors.email}
                        required
                        startIcon={<Icons.UserCircle className="w-4 h-4" />}
                    />
                    <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password)
                                setFieldErrors({
                                    ...fieldErrors,
                                    password: undefined,
                                });
                        }}
                        error={!!fieldErrors.password}
                        startIcon={<Icons.Lock className="w-4 h-4" />}
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="remember-me"
                        type="checkbox"
                        className="h-3.5 w-3.5 text-primary  border-primary/25 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary cursor-pointer accent-primary dark:accent-white"
                    />
                    <label
                        htmlFor="remember-me"
                        className="text-[12.5px] font-medium text-primary/50 dark:text-primary/40 cursor-pointer hover:text-primary/90 dark:hover:text-primary/20 transition-colors"
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
                    disabled={isLoading}
                    loading={isLoading}
                    variant="default"
                    startIcon={<LogIn className="w-4 h-4" />}
                >
                    Login
                </Button>
            </form>
        </div>
    );
}
