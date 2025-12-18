import { useState } from 'react';
import {
    FaCheckCircle,
    FaEnvelope,
    FaExclamationTriangle,
    FaEye,
    FaEyeSlash,
    FaLock,
    FaSpinner,
    FaUser,
    FaBuilding,
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router';
import {
    useAcceptInvitation,
    useVerifyInvitation,
} from '../../services/apis/authApi';
import Button from '../typography/Button';

const AcceptInvitationForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Verify invitation token
    const {
        data: verificationData,
        isLoading: isVerifying,
        error: verificationError,
    } = useVerifyInvitation(token);

    const { mutateAsync: acceptInvitation, isPending: isAccepting } =
        useAcceptInvitation();

    const validatePassword = (pwd: string): string[] => {
        const issues: string[] = [];
        if (pwd.length < 8) {
            issues.push('at least 8 characters');
        }
        if (!/[A-Z]/.test(pwd)) {
            issues.push('one uppercase letter');
        }
        if (!/[a-z]/.test(pwd)) {
            issues.push('one lowercase letter');
        }
        if (!/[0-9]/.test(pwd)) {
            issues.push('one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
            issues.push('one special character');
        }
        return issues;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        // Validate password
        const passwordIssues = validatePassword(password);
        if (passwordIssues.length > 0) {
            newErrors.password = `Password must contain ${passwordIssues.join(', ')}`;
        }

        // Validate confirm password
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await acceptInvitation({
                token,
                password,
            });
        } catch (error) {
            console.error('Accept invitation error:', error);
        }
    };

    // Loading state
    if (isVerifying) {
        return (
            <div className="text-center py-12">
                <FaSpinner className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-primary mb-2">
                    Verifying Invitation
                </h2>
                <p className="text-primary-50">
                    Please wait while we verify your invitation...
                </p>
            </div>
        );
    }

    // Error state
    if (verificationError || !verificationData?.success) {
        return (
            <div className="text-center py-8">
                <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-primary mb-2">
                    Invalid or Expired Invitation
                </h2>
                <p className="text-primary-50 mb-6">
                    {verificationData?.message ||
                        'This invitation link is invalid or has expired. Please contact your administrator for a new invitation.'}
                </p>
                <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="w-full"
                >
                    Go to Login
                </Button>
            </div>
        );
    }

    const invitationData = verificationData.data;

    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">
                    Accept Invitation
                </h2>
                <p className="text-sm text-primary-50">
                    Complete your account setup to get started
                </p>
            </div>

            {/* Invitation Details */}
            {invitationData && (
                <div className="bg-primary-5 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                            <FaUser className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-primary-50">Full Name</p>
                            <p className="text-sm font-medium text-primary truncate">
                                {invitationData.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                            <FaEnvelope className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-primary-50">
                                Email Address
                            </p>
                            <p className="text-sm font-medium text-primary truncate">
                                {invitationData.email}
                            </p>
                        </div>
                    </div>
                    {invitationData.role && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                                <FaCheckCircle className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-primary-50">Role</p>
                                <p className="text-sm font-medium text-primary truncate">
                                    {invitationData.role.displayName}
                                </p>
                            </div>
                        </div>
                    )}
                    {invitationData.tenant && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                                <FaBuilding className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-primary-50">
                                    Organization
                                </p>
                                <p className="text-sm font-medium text-primary truncate">
                                    {invitationData.tenant.name}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password Field */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-primary mb-2"
                    >
                        Create Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-50">
                            <FaLock className="w-4 h-4" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        password: '',
                                    }));
                                }
                            }}
                            className="w-full pl-10 pr-10 py-2.5 border border-primary-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Enter your password"
                            required
                            disabled={isAccepting}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-50 hover:text-primary transition-colors"
                            disabled={isAccepting}
                        >
                            {showPassword ? (
                                <FaEyeSlash className="w-4 h-4" />
                            ) : (
                                <FaEye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FaExclamationTriangle className="w-3 h-3" />
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-primary mb-2"
                    >
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-50">
                            <FaLock className="w-4 h-4" />
                        </div>
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (errors.confirmPassword) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        confirmPassword: '',
                                    }));
                                }
                            }}
                            className="w-full pl-10 pr-10 py-2.5 border border-primary-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="Confirm your password"
                            required
                            disabled={isAccepting}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-50 hover:text-primary transition-colors"
                            disabled={isAccepting}
                        >
                            {showConfirmPassword ? (
                                <FaEyeSlash className="w-4 h-4" />
                            ) : (
                                <FaEye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FaExclamationTriangle className="w-3 h-3" />
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                        Password Requirements:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            One lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            One number
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            One special character
                        </li>
                    </ul>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={isAccepting}
                    disabled={isAccepting}
                >
                    {isAccepting
                        ? 'Creating Account...'
                        : 'Accept & Create Account'}
                </Button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center">
                <p className="text-xs text-primary-50">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-primary hover:text-primary-75 font-medium underline"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </>
    );
};

export default AcceptInvitationForm;
