import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Button from '../../components/typography/Button';
import { InputField } from '../../components/typography/InputFields';
import { useVerifyMfa } from '../../services/apis/authApi';

const OtpVerificationpage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { email?: string; mfaType?: string } | null;

    const [code, setCode] = useState('');

    const email = state?.email;
    const mfaType = state?.mfaType || 'email';

    const { mutateAsync: verifyMfa, isPending: isVerifying } = useVerifyMfa();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            // If we somehow lost state, send user back to login
            navigate('/login');
            return;
        }

        await verifyMfa({ email, code });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-lightBg px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-primary-10">
                <h1 className="text-2xl font-bold text-primary mb-2">
                    Enter Verification Code
                </h1>
                <p className="text-sm text-primary-50 mb-6">
                    We&apos;ve sent a {mfaType} verification code to{' '}
                    <span className="font-semibold text-primary">
                        {email || 'your email'}
                    </span>
                    . Please enter it below to continue.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        id="otp-code"
                        label="Verification Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter the 6-digit code"
                        required
                    />

                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={isVerifying}
                            disabled={isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                        </Button>
                        {/* <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleBackToLogin}
                        >
                            Back to Login
                        </Button> */}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OtpVerificationpage;
