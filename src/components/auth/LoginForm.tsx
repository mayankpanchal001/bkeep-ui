import React, { useState } from 'react';
import { useLogin } from '../../services/apis/authApi';

import { showErrorToast } from '../../utills/toast';
import Button from '../typography/Button';
import { InputField } from '../typography/InputFields';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {
        mutateAsync: login,
        isPending: isLoading,
        error: loginError,
    } = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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
        <div className="space-y-8">
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <InputField
                        id="login-email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={undefined}
                    />
                    <InputField
                        id="login-password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        icon={undefined}
                    />
                </div>

                <div className="flex items-center gap-2.5">
                    <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-black border-gray-300 rounded-md focus:ring-black/10 cursor-pointer accent-black transition-all"
                    />
                    <label
                        htmlFor="remember-me"
                        className="text-[13.5px] font-medium text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
                    >
                        Remember me for 30 days
                    </label>
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
                    disabled={isLoading}
                >
                    Login to Account
                </Button>
            </form>
        </div>
    );
}
