import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useLogin } from '../../services/apis/authApi';
import { getStoredPasskeyUser } from '../../utills/passkey';
import { showErrorToast } from '../../utills/toast';
import { LogIn } from 'lucide-react';
import { FaFingerprint } from 'react-icons/fa';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import Input from '../ui/input';

export type LoginFormProps = {
    /** Pre-fill email (e.g. from "Other method" after verify step) */
    initialEmail?: string;
    /** When true, email field is read-only */
    lockEmail?: boolean;
};

export function LoginForm({
    initialEmail,
    lockEmail = false,
}: LoginFormProps = {}) {
    const [email, setEmail] = useState(initialEmail ?? '');
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

    useEffect(() => {
        if (initialEmail !== undefined) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    const hasStoredPasskeyUser = useMemo(
        () => getStoredPasskeyUser() !== null,
        []
    );
    const showPasskeyLink = hasStoredPasskeyUser && !initialEmail;

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
                            if (!lockEmail) {
                                setEmail(e.target.value);
                                if (fieldErrors.email)
                                    setFieldErrors({
                                        ...fieldErrors,
                                        email: undefined,
                                    });
                            }
                        }}
                        readOnly={lockEmail}
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
                        className="h-4 w-4 text-primary border-primary/25 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary cursor-pointer accent-primary dark:accent-white"
                    />
                    <label
                        htmlFor="remember-me"
                        className="text-xs sm:text-sm font-medium text-primary/70 dark:text-primary/65 cursor-pointer hover:text-primary dark:hover:text-primary/85 transition-colors leading-normal tracking-normal"
                    >
                        Remember me for 30 days
                    </label>
                </div>

                {error && (
                    <div className="border border-red-100 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-center text-red-600 dark:text-red-400 font-semibold tracking-normal leading-relaxed">
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

                {showPasskeyLink && (
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-primary/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-transparent px-2 text-primary/60">
                                or
                            </span>
                        </div>
                        <Link to="/passkey-login" className="mt-3 block">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                startIcon={
                                    <FaFingerprint className="w-4 h-4" />
                                }
                            >
                                Sign in with passkey
                            </Button>
                        </Link>
                    </div>
                )}
            </form>
        </div>
    );
}
