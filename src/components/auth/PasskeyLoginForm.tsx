import { startAuthentication } from '@simplewebauthn/browser';
import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaFingerprint, FaTimes, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router';
import { APP_TITLE } from '../../constants';
import type { PasskeyLoginOptionsJSON } from '../../services/apis/authApi';
import {
    usePasskeyLoginInit,
    usePasskeyLoginVerify,
} from '../../services/apis/authApi';
import {
    getInsecureContextMessage,
    getPasskeyUnavailableReason,
    getStoredPasskeyUser,
    isSecureContext,
    isWebAuthnSupported,
    removePasskeyUser,
    storePasskeyUser,
} from '../../utills/passkey';
import { logPasskeyDiagnostics } from '../../utills/passkeyDebug';
import { showErrorToast, showSuccessToast } from '../../utills/toast';
import { Button } from '../ui/button';

/**
 * Normalize backend response to options shape expected by startAuthentication.
 * Handles data.options or allowCredentials at data level; ensures allowCredentials is an array.
 */
function normalizePasskeyLoginOptions(data: {
    options?: Partial<PasskeyLoginOptionsJSON>;
    allowCredentials?: PasskeyLoginOptionsJSON['allowCredentials'];
}): PasskeyLoginOptionsJSON {
    const options: Partial<PasskeyLoginOptionsJSON> = data.options ?? {};
    const allowCredentials =
        options.allowCredentials ?? data.allowCredentials ?? [];
    if (!options.challenge) {
        throw new Error('Invalid passkey options: missing challenge');
    }
    return {
        challenge: options.challenge,
        rpId: options.rpId,
        timeout: options.timeout,
        userVerification: options.userVerification,
        allowCredentials: Array.isArray(allowCredentials)
            ? allowCredentials
            : [],
    };
}

export function PasskeyLoginForm() {
    const [storedUser, setStoredUser] = useState(getStoredPasskeyUser());
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showSessionTimeout, setShowSessionTimeout] = useState(false);
    const [webAuthnSupported, setWebAuthnSupported] = useState(true);
    const navigate = useNavigate();

    const { mutateAsync: initPasskeyLogin } = usePasskeyLoginInit();
    const { mutateAsync: verifyPasskeyLogin } = usePasskeyLoginVerify();

    useEffect(() => {
        // Run diagnostics on page load
        logPasskeyDiagnostics().catch(console.error);

        // Check for stored user ID
        const user = getStoredPasskeyUser();

        if (import.meta.env.DEV) {
            console.log('Stored passkey user:', user);
        }
        if (user) {
            setStoredUser(user);
        } else if (import.meta.env.DEV) {
            console.warn('No stored passkey user found in localStorage');
        }

        // Check if WebAuthn is supported
        const isSupported = isWebAuthnSupported();
        if (import.meta.env.DEV) {
            console.log('WebAuthn supported:', isSupported);
        }
        setWebAuthnSupported(isSupported);

        // Check if redirected from session timeout
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('timeout') === 'true') {
            setShowSessionTimeout(true);
        }
    }, []);

    const handlePasskeyLogin = async () => {
        if (!storedUser) {
            showErrorToast(
                'No passkey account found. Please sign in with email and password first to set up passkey login.'
            );
            return;
        }

        if (!isSecureContext()) {
            showErrorToast(getInsecureContextMessage());
            return;
        }

        setIsAuthenticating(true);
        if (import.meta.env.DEV) {
            console.log(
                'Starting passkey authentication for:',
                storedUser.email
            );
        }

        try {
            // Step 1: Get challenge and credentials from server
            const initResponse = await initPasskeyLogin({
                email: storedUser.email,
            });

            if (!initResponse?.data) {
                throw new Error('Failed to get passkey options from server');
            }

            const options = normalizePasskeyLoginOptions(initResponse.data);

            // Step 2: Start authentication ceremony using SimpleWebAuthn
            const credential = await startAuthentication({
                optionsJSON: options,
            });

            if (import.meta.env.DEV) {
                console.log(
                    '🔐 Credential from startAuthentication:',
                    credential
                );
                console.log('🔐 Credential structure:', {
                    id: credential.id,
                    rawId: credential.rawId,
                    type: credential.type,
                    response: credential.response,
                });
            }

            // Step 3: Send credential to server for verification
            // Explicitly structure the credential to ensure all fields are serializable
            await verifyPasskeyLogin({
                credential: {
                    id: credential.id,
                    rawId: credential.rawId,
                    response: credential.response,
                    type: credential.type,
                    clientExtensionResults:
                        credential.clientExtensionResults as Record<
                            string,
                            unknown
                        >,
                    authenticatorAttachment: credential.authenticatorAttachment,
                },
            });

            // Update last accessed timestamp
            storePasskeyUser(storedUser.email, credential.id);
            setStoredUser(getStoredPasskeyUser());
            // Navigation is handled by the verifyPasskeyLogin hook
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Passkey authentication failed:', error);
            }

            // Handle different error types
            if (
                error instanceof Error &&
                error.message.includes('No passkeys found')
            ) {
                // Show the specific error message we threw
                showErrorToast(error.message);
            } else if (error instanceof DOMException) {
                // Handle WebAuthn-specific errors
                if (error.name === 'NotAllowedError') {
                    showErrorToast(
                        'Authentication was cancelled or not allowed. Please try again.'
                    );
                } else if (error.name === 'SecurityError') {
                    showErrorToast(getInsecureContextMessage());
                } else if (error.name === 'AbortError') {
                    showErrorToast(
                        'Authentication was aborted. Please try again.'
                    );
                } else if (error.name === 'NotSupportedError') {
                    showErrorToast(
                        'Your device does not support this type of passkey.'
                    );
                } else if (error.name === 'InvalidStateError') {
                    showErrorToast('Passkey is not registered on this device.');
                } else {
                    showErrorToast(`Authentication error: ${error.message}`);
                }
            } else if (error instanceof Error) {
                // Handle generic errors
                showErrorToast(
                    error.message ||
                        'Passkey authentication failed. Please try again.'
                );
            }
            // Note: API errors are handled by the usePasskeyLoginInit and usePasskeyLoginVerify hooks
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

    const passkeyUnavailableReason = getPasskeyUnavailableReason();
    if (!webAuthnSupported && passkeyUnavailableReason !== null) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-red-600 mb-4">
                    {passkeyUnavailableReason === 'insecure-context'
                        ? getInsecureContextMessage()
                        : 'Passkey authentication is not supported in this browser. Please use a modern browser or sign in with email and password.'}
                </p>
                <Link to="/login">
                    <Button
                        variant="default"
                        startIcon={<LogIn className="w-4 h-4" />}
                    >
                        Go to Sign In
                    </Button>
                </Link>
            </div>
        );
    }

    if (!storedUser) {
        return (
            <div className="space-y-6 text-center py-8">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaFingerprint className="w-8 h-8 text-primary/50" />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                        No Passkey Account Found
                    </h3>
                    <p className="text-sm text-primary/75 mb-4">
                        To use passkey login, you need to:
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-left">
                    <ol className="text-sm text-blue-900 flex flex-col gap-2">
                        <li className="flex gap-2">
                            <span className="font-semibold">1.</span>
                            <span>Sign in with your email and password</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-semibold">2.</span>
                            <span>Go to Settings → Security</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-semibold">3.</span>
                            <span>
                                Click "Passkey Management" and register a
                                passkey
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-semibold">4.</span>
                            <span>Return here to use passkey login</span>
                        </li>
                    </ol>
                </div>

                <Link to="/login">
                    <Button
                        variant="default"
                        className="w-full"
                        startIcon={<FaUser className="w-4 h-4" />}
                    >
                        Sign In with Email & Password
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Session Timeout Alert */}
            {showSessionTimeout && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
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
                        className="shrink-0 text-blue-600 hover:text-blue-800"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* User ID Section */}
            <div className="border border-primary/10 bg-card rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-primary/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">
                            {storedUser.email}
                        </p>
                        <p className="text-xs text-primary/50 mt-1">
                            Last accessed {storedUser.lastAccessed} on this
                            device with {APP_TITLE}
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="text-xs text-primary/50 leading-relaxed">
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
                variant="default"
                className="w-full normal-case"
                startIcon={<FaFingerprint className="w-5 h-5" />}
                onClick={handlePasskeyLogin}
                loading={isAuthenticating}
                disabled={isAuthenticating}
            >
                {isAuthenticating
                    ? 'Authenticating with passkey...'
                    : 'Sign in with Passkey '}
            </Button>

            {/* Other Actions */}
            <div className="pt-4 border-t border-primary/10">
                <p className="text-sm font-medium text-primary mb-3">
                    Other actions
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleUseDifferentAccount}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/10 bg-card hover:bg-primary/5 transition-colors text-left"
                    >
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaUser className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-primary/75">
                            Use a different account
                        </span>
                    </button>
                    <button
                        onClick={handleRemoveUserID}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/10 bg-card hover:bg-primary/5 transition-colors text-left"
                    >
                        <div className="shrink-0 w-8 h-8 rounded-full bg-red-10 flex items-center justify-center">
                            <FaTimes className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm text-primary/75">
                            Remove a user ID
                        </span>
                    </button>
                </div>
            </div>

            {/* New to BKeep */}
            <div className="pt-4 text-center">
                <p className="text-sm text-primary/50">
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
                <p className="text-xs text-primary/40">
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
