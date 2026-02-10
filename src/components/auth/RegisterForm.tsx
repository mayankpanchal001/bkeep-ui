import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import { Icons } from '../shared/Icons';
import { Button } from '../ui/button';
import Input from '../ui/input';

export function RegisterForm() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const errors: {
            name?: string;
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        // Name validation
        if (!name.trim()) {
            errors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

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

        // Confirm password validation
        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // TODO: Implement registration API call
            // For now, just show a message and redirect to login
            showSuccessToast('Registration successful! Please login.');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err: unknown) {
            let message = 'Registration failed. Please try again.';
            showErrorToast(message);

            if (err && typeof err === 'object' && 'response' in err) {
                const response = (
                    err as { response?: { data?: { message?: string } } }
                ).response;
                message = response?.data?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-5">
                    <Input
                        id="register-name"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setName(e.target.value);
                            if (fieldErrors.name)
                                setFieldErrors({
                                    ...fieldErrors,
                                    name: undefined,
                                });
                        }}
                        error={!!fieldErrors.name}
                        required
                        startIcon={<Icons.UserCircle className="w-4 h-4" />}
                    />
                    <Input
                        id="register-email"
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
                        startIcon={<Icons.Mail className="w-4 h-4" />}
                    />
                    <Input
                        id="register-password"
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
                    <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setConfirmPassword(e.target.value);
                            if (fieldErrors.confirmPassword)
                                setFieldErrors({
                                    ...fieldErrors,
                                    confirmPassword: undefined,
                                });
                        }}
                        error={!!fieldErrors.confirmPassword}
                        startIcon={<Icons.Lock className="w-4 h-4" />}
                        required
                    />
                </div>

                {error && (
                    <div className="border border-red-100 bg-red-50/50 p-2.5 rounded-lg">
                        <p className="text-[12px] text-center text-red-600 font-medium tracking-tight">
                            {error}
                        </p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    variant="default"
                    startIcon={<UserPlus className="w-4 h-4" />}
                    className="w-full"
                >
                    Create Account
                </Button>
            </form>
        </div>
    );
}
