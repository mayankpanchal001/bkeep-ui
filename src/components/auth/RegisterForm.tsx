import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';

export function RegisterForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});
    const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
    const navigate = useNavigate();

    // ... rest of the service logic ...
    const { register, isLoading } = {
        register: () => Promise.resolve(true),
        isLoading: false,
    };

    const validateForm = () => {
        const errors: typeof fieldErrors = {};

        if (!fullName) {
            errors.fullName = 'Full name is required';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.email = 'Email address is required';
        } else if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address.';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        const success = await register();
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Registration failed. Please try again.');
        }
    };

    const handleGoogleRegister = async () => {
        setIsOAuthLoading('google');
        setError('');
        try {
            console.log('Google registration initiated');
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch {
            setError('Failed to sign up with Google');
        } finally {
            setIsOAuthLoading(null);
        }
    };

    const handleOutlookRegister = async () => {
        setIsOAuthLoading('outlook');
        setError('');
        try {
            console.log('Outlook registration initiated');
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch {
            setError('Failed to sign up with Outlook');
        } finally {
            setIsOAuthLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* OAuth Register Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full !rounded-md !normal-case h-9 text-[13px] border-primary/10 hover:bg-white bg-[#f8f9fa] text-primary/70 shadow-sm"
                    onClick={handleGoogleRegister}
                    loading={isOAuthLoading === 'google'}
                    disabled={isOAuthLoading !== null || isLoading}
                    icon={
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
                                fill="#EA4335"
                            />
                        </svg>
                    }
                >
                    Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full !rounded-md !normal-case h-9 text-[13px] border-primary/10 hover:bg-white bg-[#f8f9fa] text-primary/70 shadow-sm"
                    onClick={handleOutlookRegister}
                    loading={isOAuthLoading === 'outlook'}
                    disabled={isOAuthLoading !== null || isLoading}
                    icon={
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
                                fill="#f25022"
                            />
                        </svg>
                    }
                >
                    Outlook
                </Button>
            </div>

            {/* Separator */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/10"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                    <span className="bg-white px-3 text-primary/40">
                        Or continue with
                    </span>
                </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <InputField
                        id="register-fullname"
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => {
                            setFullName(e.target.value);
                            if (fieldErrors.fullName)
                                setFieldErrors({
                                    ...fieldErrors,
                                    fullName: undefined,
                                });
                        }}
                        error={fieldErrors.fullName}
                        required
                        icon={undefined}
                    />
                    <InputField
                        id="register-email"
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
                        id="register-password"
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
                    <InputField
                        id="register-confirm-password"
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (fieldErrors.confirmPassword)
                                setFieldErrors({
                                    ...fieldErrors,
                                    confirmPassword: undefined,
                                });
                        }}
                        error={fieldErrors.confirmPassword}
                        required
                        icon={undefined}
                    />
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
                    className="w-full !rounded-md !normal-case h-9 text-sm font-semibold mt-2"
                    loading={isLoading}
                    disabled={isLoading || isOAuthLoading !== null}
                >
                    Create Account
                </Button>
            </form>
        </div>
    );
}
