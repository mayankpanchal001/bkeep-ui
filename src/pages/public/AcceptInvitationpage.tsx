import AcceptInvitationForm from '@/components/auth/AcceptInvitationForm';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';
import { Mail, Sparkles, UserCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { APP_TITLE } from '../../constants';
import { AuthStore } from '../../stores/auth/authStore';
import { logo } from '../../utills/image';

const AcceptInvitationpage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const hasLoggedOut = useRef(false);

    // Logout user immediately when they visit this page (before any redirects)
    // Call clearAuth directly from store to ensure it happens synchronously
    useEffect(() => {
        if (!hasLoggedOut.current) {
            AuthStore.getState().clearAuth();
            hasLoggedOut.current = true;
        }
    }, []);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    return (
        <div className="grid h-dvh justify-center p-2 lg:grid-cols-2 overflow-hidden relative bg-muted">
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"></div>
            <div
                className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse"
                style={{ animationDelay: '1s' }}
            ></div>
            <div
                className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
                style={{ animationDelay: '2s' }}
            ></div>

            {/* Left Side - Accept Invitation Form Section */}
            <div className="flex max-sm:w-screen items-center justify-center h-full relative z-10 bg-transparent overflow-y-auto">
                <div className="absolute top-8 right-8 z-20">
                    <ThemeSwitcher />
                </div>
                <div className="w-full max-w-md py-8">
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <Link to="/" className="inline-block mb-4">
                            <img
                                src={logo}
                                alt="BKeep Accounting Logo"
                                className="h-12 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Accept Invitation Form Card */}
                    <div className="p-8 lg:p-12">
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 relative">
                                <Mail className="w-8 h-8 text-primary" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-primary-foreground" />
                                </div>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-primary mb-2 tracking-tight">
                                You're Invited!
                            </h2>
                            <p className="text-sm sm:text-base text-primary/70 dark:text-primary/65 font-medium leading-relaxed">
                                Complete your account setup to join the team
                            </p>
                        </div>
                        <AcceptInvitationForm />
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <p className="text-xs sm:text-sm text-primary/70 dark:text-primary/65 font-medium tracking-normal">
                            © {new Date().getFullYear()}, {APP_TITLE}.
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
            </div>

            {/* Right Side - Branding Section */}
            <div className="hidden lg:flex p-1 h-full">
                <div className="w-full bg-card rounded-[24px] p-10 relative overflow-hidden h-full">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M40 40v-8h-4v8h-8v4h8v8h4v-8h8v-4h-8zm0-40V0h-4v4h-8v4h8v4h4V8h8V4h-8zM0 40v-8H-4v8h-8v4h8v8H-4v-8h-8v-4h8zM0 4V0H-4v4h-8v4h8v4H-4V8h-8V4h8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '80px 80px',
                                animation: 'pattern-move 20s linear infinite',
                            }}
                        />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-indigo-500/5"></div>

                    {/* Content */}
                    <div className="relative z-10 w-full flex flex-col h-full">
                        {/* Logo and Header */}
                        <div className="mb-8">
                            <div className="mb-6">
                                <img
                                    src={logo}
                                    alt="Bkeep Logo"
                                    className="h-24 w-24 object-contain"
                                />
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight text-primary mb-3 tracking-tight">
                                Welcome to the Team
                            </h1>
                            <p className="text-base lg:text-lg text-primary/70 dark:text-primary/65 font-medium tracking-normal leading-relaxed">
                                You've been invited to join {APP_TITLE}. Let's
                                get you set up!
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="flex-1 flex flex-col justify-center gap-6 mb-8">
                            <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-xl border border-primary/10 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <UserCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-primary text-lg font-semibold mb-1">
                                        Join Your Organization
                                    </h3>
                                    <p className="text-primary/70 dark:text-primary/65 text-sm leading-relaxed font-medium">
                                        Connect with your team and start
                                        collaborating on accounting tasks
                                        seamlessly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-indigo-500/5 rounded-xl border border-indigo-500/10 backdrop-blur-sm hover:bg-indigo-500/10 transition-all duration-300">
                                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-primary text-lg font-semibold mb-1">
                                        Get Started Instantly
                                    </h3>
                                    <p className="text-primary/70 dark:text-primary/65 text-sm leading-relaxed font-medium">
                                        Complete your setup in minutes and
                                        access all features right away.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-purple-500/5 rounded-xl border border-purple-500/10 backdrop-blur-sm hover:bg-purple-500/10 transition-all duration-300">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-primary text-lg font-semibold mb-1">
                                        Secure & Private
                                    </h3>
                                    <p className="text-primary/70 dark:text-primary/65 text-sm leading-relaxed font-medium">
                                        Your data is encrypted and secure. We
                                        take privacy seriously.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto pt-6 border-t border-primary/10">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-primary text-base font-semibold mb-2">
                                        Quick Setup
                                    </h3>
                                    <p className="text-primary/70 dark:text-primary/65 text-sm leading-relaxed font-medium">
                                        Just a few steps to complete your
                                        account and start using {APP_TITLE}.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-primary text-base font-semibold mb-2">
                                        Need Help?
                                    </h3>
                                    <p className="text-primary/70 dark:text-primary/65 text-sm leading-relaxed font-medium">
                                        Contact your administrator or check our
                                        support documentation for assistance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>
                </div>
            </div>

            {/* CSS Animation for Pattern */}
            <style>{`
                @keyframes pattern-move {
                    0% { background-position: 0 0; }
                    100% { background-position: 80px 80px; }
                }
            `}</style>
        </div>
    );
};

export default AcceptInvitationpage;
