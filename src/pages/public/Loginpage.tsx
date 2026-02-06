import { LoginForm } from '@/components/auth/LoginForm';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';
import { passkeyLoginInitRequest } from '@/services/apis/authApi';
import { storePasskeyUser } from '@/utills/passkey';
import { Lock, LogIn } from 'lucide-react';
import { FaFingerprint } from 'react-icons/fa';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { logo } from '../../utills/image';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Icons } from '@/components/shared/Icons';

type LoginStep = 'email' | 'verify' | 'password';

const Loginpage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isCheckingPasskey, setIsCheckingPasskey] = useState(false);
    const [fromVerifyStep, setFromVerifyStep] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        const trimmed = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmed) {
            setEmailError('Email address is required');
            return;
        }
        if (!emailRegex.test(trimmed)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        setIsCheckingPasskey(true);
        try {
            const response = await passkeyLoginInitRequest({ email: trimmed });
            const options = response?.data?.options;
            const allowCredentials =
                options?.allowCredentials ?? response?.data?.allowCredentials;
            const hasPasskey =
                Array.isArray(allowCredentials) && allowCredentials.length > 0;
            setEmail(trimmed);
            setFromVerifyStep(false);
            setStep(hasPasskey ? 'verify' : 'password');
        } catch {
            setEmail(trimmed);
            setFromVerifyStep(false);
            setStep('password');
        } finally {
            setIsCheckingPasskey(false);
        }
    };

    const handleUsePasskey = () => {
        storePasskeyUser(email);
        navigate('/passkey-login');
    };

    const handleUseDifferentEmail = () => {
        setEmail('');
        setStep('email');
        setEmailError('');
    };

    const renderLoginContent = () => {
        if (step === 'email') {
            return (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <Input
                            id="login-email-first"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) setEmailError('');
                            }}
                            error={!!emailError}
                            required
                            startIcon={<Icons.UserCircle className="w-4 h-4" />}
                            disabled={isCheckingPasskey}
                        />
                    </div>
                    {emailError && (
                        <p className="text-sm text-destructive">{emailError}</p>
                    )}
                    <Button
                        type="submit"
                        disabled={isCheckingPasskey}
                        loading={isCheckingPasskey}
                        variant="default"
                        className="w-full"
                        startIcon={<LogIn className="w-4 h-4" />}
                    >
                        Continue
                    </Button>
                </form>
            );
        }

        if (step === 'verify') {
            return (
                <div className="space-y-6">
                    <div className="rounded-lg border border-primary/10 bg-muted/30 p-3">
                        <p className="text-sm font-medium text-primary">
                            {email}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="default"
                            className="w-full"
                            startIcon={<FaFingerprint className="w-5 h-5" />}
                            onClick={handleUsePasskey}
                        >
                            Use passkey
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            startIcon={<Lock className="w-4 h-4" />}
                            onClick={() => {
                                setFromVerifyStep(true);
                                setStep('password');
                            }}
                        >
                            Enter password
                        </Button>
                    </div>
                    <button
                        type="button"
                        onClick={handleUseDifferentEmail}
                        className="w-full text-center text-sm text-primary/70 hover:text-primary hover:underline"
                    >
                        Use a different email
                    </button>
                </div>
            );
        }

        return <LoginForm initialEmail={email} lockEmail={true} />;
    };

    const getStepHeading = () => {
        if (step === 'email') {
            return {
                title: 'Login to your account',
                subtitle: 'Please enter your details to login.',
            };
        }
        if (step === 'verify') {
            return {
                title: "Verify it's you",
                subtitle: 'Choose how you want to verify your identity',
            };
        }
        return {
            title: 'Enter your password',
            subtitle: `Sign in as ${email}`,
        };
    };

    const showBackFromPassword = step === 'password';
    const handleBackFromPassword = () => {
        setStep(fromVerifyStep ? 'verify' : 'email');
    };

    return (
        <div className="grid h-dvh justify-center p-2 lg:grid-cols-2 overflow-hidden relative bg-muted">
            {/* Left Side - Login Form Section */}
            <div className="flex max-sm:w-screen items-center justify-center h-full relative z-10 bg-transparent">
                <div className="absolute top-8 right-8 z-20">
                    <ThemeSwitcher />
                </div>
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex flex-col items-center">
                        <img
                            src={logo}
                            alt="BKeep Accounting Logo"
                            className="h-12 w-auto mb-4"
                        />
                    </div>

                    {/* Login Form Card */}
                    <div className="p-8 lg:p-12">
                        <div className="mb-8 text-center">
                            <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-primary mb-2 tracking-tight">
                                {getStepHeading().title}
                            </h2>
                            <p className="text-sm sm:text-base text-primary/70 dark:text-primary/65 font-medium leading-relaxed">
                                {getStepHeading().subtitle}
                            </p>
                        </div>
                        {showBackFromPassword && (
                            <button
                                type="button"
                                onClick={handleBackFromPassword}
                                className="mb-4 text-sm text-primary/70 hover:text-primary hover:underline"
                            >
                                Back
                            </button>
                        )}
                        {renderLoginContent()}
                    </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-primary/65 font-medium tracking-normal">
                        © 2025, Bkeep Accounting.
                    </p>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link
                            to="/privacy"
                            className="text-xs sm:text-sm text-primary/70 dark:text-primary/65 font-medium hover:text-primary dark:hover:text-primary/90 transition-colors tracking-normal"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className="text-xs sm:text-sm text-primary/70 dark:text-primary/65 font-medium hover:text-primary dark:hover:text-primary/90 transition-colors tracking-normal"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding Section */}
            <div className="hidden lg:flex p-1 h-full">
                <div className="w-full bg-card rounded-[24px] p-10 relative overflow-hidden h-full">
                    <div className="relative z-10 w-full flex flex-col items-start">
                        <Link to="/" className="mb-4 cursor-pointer">
                            <img
                                src={logo}
                                alt="Bkeep Logo"
                                className="h-24 w-24 object-contain"
                            />
                        </Link>
                        <h1 className="text-2xl lg:text-3xl font-semibold leading-tight text-primary mb-2 tracking-tight">
                            Bkeep Accounting
                        </h1>
                        <p className="text-base lg:text-lg text-primary/70 dark:text-primary/65 font-medium tracking-normal leading-relaxed">
                            Manage. Track. Grow. Succeed.
                        </p>
                    </div>

                    {/* Branding Footer Info */}
                    <div className="absolute bottom-6 left-10 right-6">
                        <div className="relative grid grid-cols-2 border-primary/10 pt-6 pb-4">
                            {/* Vertical Divider */}
                            <div className="absolute left-1/2 top-6 h-[72px] w-px bg-primary/10"></div>

                            {/* Left Section */}
                            <div className="pr-9">
                                <h3 className="text-primary text-base font-semibold mb-1">
                                    Ready to launch?
                                </h3>
                                <p className="text-primary/70 dark:text-primary/65 text-sm leading-relaxed font-medium">
                                    Clone the repo, install dependencies, and
                                    your dashboard is live in minutes.
                                </p>
                            </div>

                            {/* Right Section */}
                            <div className="pl-6">
                                <h3 className="text-primary text-base font-semibold mb-1">
                                    Need help?
                                </h3>
                                <p className="text-primary/70 dark:text-primary/65 text-sm leading-relaxed font-medium">
                                    Check out the docs or open an issue on
                                    GitHub, community support is just a click
                                    away.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loginpage;
