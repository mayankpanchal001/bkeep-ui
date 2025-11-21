import { useEffect, useState } from 'react';
import { FaFingerprint, FaTimes, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import { APP_TITLE } from '../../constants';
import {
    getStoredPasskeyUser,
    removePasskeyUser,
    storePasskeyUser,
} from '../../utills/passkey';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import Button from '../typography/Button';

export function PasskeyLoginForm() {
    const [storedUser, setStoredUser] = useState(getStoredPasskeyUser());
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showSessionTimeout, setShowSessionTimeout] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for stored user ID
        const user = getStoredPasskeyUser();
        if (user) {
            setStoredUser(user);
        }

        // Check if redirected from session timeout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('timeout') === 'true') {
            setShowSessionTimeout(true);
        }
    }, []);

    const handlePasskeyLogin = async () => {
        if (!storedUser) {
            showErrorToast('No passkey account found');
            return;
        }

        setIsAuthenticating(true);

        try {
            // WebAuthn authentication
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: new Uint8Array(32), // Should come from server
                    allowCredentials: [], // Should come from server based on user
                    timeout: 60000,
                    userVerification: 'required',
                },
            });

            if (credential) {
                // Send credential to server for verification
                // For now, we'll simulate success
                showSuccessToast('Passkey authentication successful');

                // Update last accessed
                if (storedUser) {
                    storePasskeyUser(storedUser.email);
                    setStoredUser(getStoredPasskeyUser());
                }

                // Navigate to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 500);
            }
        } catch (error) {
            console.error('Passkey authentication failed:', error);
            showErrorToast('Passkey authentication failed. Please try again.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleUseDifferentAccount = () => {
        removePasskeyUser();
        setStoredUser(null);
        navigate('/login');
    };

    const handleRemoveUserID = () => {
        removePasskeyUser();
        setStoredUser(null);
        showSuccessToast('User ID removed');
    };

    if (!storedUser) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-primary-75 mb-4">
                    No passkey account found. Please sign in with email and
                    password first.
                </p>
                <Link to="/login">
                    <Button variant="primary">Go to Sign In</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Session Timeout Alert */}
            {showSessionTimeout && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                            Your session timed out.
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            Sign in again to continue.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSessionTimeout(false)}
                        className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* User ID Section */}
            <div className="border border-primary-10 bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">
                            {storedUser.email}
                        </p>
                        <p className="text-xs text-primary-50 mt-1">
                            Last accessed {storedUser.lastAccessed} on this
                            device with {APP_TITLE}
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="text-xs text-primary-50 leading-relaxed">
                By signing in to access your {APP_TITLE} Account, you agree to{' '}
                <Link
                    to="/terms"
                    className="text-primary hover:underline"
                    target="_blank"
                >
                    {APP_TITLE} Terms
                </Link>
                . Our{' '}
                <Link
                    to="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                >
                    Privacy Policy
                </Link>{' '}
                applies to your personal data. Standard call or SMS rates may
                apply.
            </div>

            {/* Passkey Login Button */}
            <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full normal-case"
                onClick={handlePasskeyLogin}
                loading={isAuthenticating}
                disabled={isAuthenticating}
            >
                <FaFingerprint className="w-5 h-5" />
                {isAuthenticating
                    ? 'Authenticating with passkey...'
                    : 'Sign in with Passkey'}
            </Button>

            {/* Other Actions */}
            <div className="pt-4 border-t border-primary-10">
                <p className="text-sm font-medium text-primary mb-3">
                    Other actions
                </p>
                <div className="space-y-2">
                    <button
                        onClick={handleUseDifferentAccount}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-primary-10 bg-white hover:bg-primary-5 transition-colors text-left"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-10 flex items-center justify-center">
                            <FaUser className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-primary-75">
                            Use a different account
                        </span>
                    </button>
                    <button
                        onClick={handleRemoveUserID}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-primary-10 bg-white hover:bg-primary-5 transition-colors text-left"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-10 flex items-center justify-center">
                            <FaTimes className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm text-primary-75">
                            Remove a user ID
                        </span>
                    </button>
                </div>
            </div>

            {/* New to BKeep */}
            <div className="pt-4 text-center">
                <p className="text-sm text-primary-50">
                    New to {APP_TITLE}?{' '}
                    <Link
                        to="/register"
                        className="text-primary font-medium hover:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </div>

            {/* reCAPTCHA Notice */}
            <div className="pt-4 text-center">
                <p className="text-xs text-primary-40">
                    Invisible reCAPTCHA by Google{' '}
                    <Link
                        to="https://policies.google.com/privacy"
                        className="text-primary hover:underline"
                        target="_blank"
                    >
                        Privacy Policy
                    </Link>
                    , and{' '}
                    <Link
                        to="https://policies.google.com/terms"
                        className="text-primary hover:underline"
                        target="_blank"
                    >
                        Terms of Use
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
