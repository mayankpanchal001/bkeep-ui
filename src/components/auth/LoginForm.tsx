import React, { useState } from 'react';
import { FaGoogle, FaLock, FaMicrosoft, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login, isLoading } = {
        login: () => Promise.resolve(true),
        isLoading: false,
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await login();
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Invalid email or password');
        }
    };

    const handleGoogleLogin = async () => {
        setIsOAuthLoading('google');
        setError('');
        try {
            // TODO: Implement Google OAuth login
            // Example: await signInWithGoogle();
            console.log('Google login initiated');
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // navigate('/dashboard');
        } catch {
            setError('Failed to sign in with Google');
        } finally {
            setIsOAuthLoading(null);
        }
    };

    const handleOutlookLogin = async () => {
        setIsOAuthLoading('outlook');
        setError('');
        try {
            // TODO: Implement Microsoft/Outlook OAuth login
            // Example: await signInWithMicrosoft();
            console.log('Outlook login initiated');
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // navigate('/dashboard');
        } catch {
            setError('Failed to sign in with Outlook');
        } finally {
            setIsOAuthLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* OAuth Login Buttons */}
            <div className="space-y-3">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    loading={isOAuthLoading === 'google'}
                    disabled={isOAuthLoading !== null || isLoading}
                    icon={<FaGoogle className="w-5 h-5" />}
                >
                    Continue with Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleOutlookLogin}
                    loading={isOAuthLoading === 'outlook'}
                    disabled={isOAuthLoading !== null || isLoading}
                    icon={<FaMicrosoft className="w-5 h-5" />}
                >
                    Continue with Outlook
                </Button>
            </div>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary-25"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-primary-50">
                        Or continue with
                    </span>
                </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <InputField
                        label="Email ID"
                        type="email"
                        placeholder="abc@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={<FaUser className="w-4 h-4" />}
                    />
                    <div>
                        <InputField
                            label="Password"
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
                        <p className="text-sm text-red-700 font-medium">
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
                    disabled={isLoading || isOAuthLoading !== null}
                >
                    Sign In
                </Button>
            </form>

            <div className="text-center pt-2">
                <p className="text-xs text-primary-50">
                    Secure login powered by our system
                </p>
            </div>
        </div>
    );
}
