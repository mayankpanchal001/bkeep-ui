import React, { useState } from 'react';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';

export function RegisterForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
    const navigate = useNavigate();
    const { register, isLoading } = {
        register: () => Promise.resolve(true),
        isLoading: false,
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

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
            // TODO: Implement Google OAuth registration
            // Example: await signUpWithGoogle();
            console.log('Google registration initiated');
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // navigate('/dashboard');
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
            // TODO: Implement Microsoft/Outlook OAuth registration
            // Example: await signUpWithMicrosoft();
            console.log('Outlook registration initiated');
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // navigate('/dashboard');
        } catch {
            setError('Failed to sign up with Outlook');
        } finally {
            setIsOAuthLoading(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* OAuth Register Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full !rounded-xl !normal-case h-11 text-[13px] border-gray-200 hover:bg-gray-50 bg-white text-gray-700"
                    onClick={handleGoogleRegister}
                    loading={isOAuthLoading === 'google'}
                    disabled={isOAuthLoading !== null || isLoading}
                    icon={<FaGoogle className="w-4 h-4 text-gray-500" />}
                >
                    Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full !rounded-xl !normal-case h-11 text-[13px] border-gray-200 hover:bg-gray-50 bg-white text-gray-700"
                    onClick={handleOutlookRegister}
                    loading={isOAuthLoading === 'outlook'}
                    disabled={isOAuthLoading !== null || isLoading}
                    icon={<FaMicrosoft className="w-4 h-4 text-gray-500" />}
                >
                    Outlook
                </Button>
            </div>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[12px] uppercase tracking-wider font-semibold">
                    <span className="bg-white px-4 text-gray-400">OR</span>
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
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        icon={undefined}
                    />
                    <InputField
                        id="register-email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={undefined}
                    />
                    <InputField
                        id="register-password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        icon={undefined}
                    />
                    <InputField
                        id="register-confirm-password"
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        icon={undefined}
                    />
                </div>

                {error && (
                    <div className="border border-red-100 bg-red-50/50 p-3.5 rounded-xl">
                        <p className="text-[13px] text-center text-red-600 font-semibold tracking-tight">
                            {error}
                        </p>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full !rounded-xl !normal-case h-12 text-sm"
                    loading={isLoading}
                    disabled={isLoading || isOAuthLoading !== null}
                >
                    Create Account
                </Button>
            </form>

            <div className="text-center">
                <p className="text-[13px] text-gray-500 font-medium">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-black font-semibold hover:underline transition-all"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
