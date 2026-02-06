import AcceptInvitationForm from '@/components/auth/AcceptInvitationForm';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
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

    // Logout user immediately when they visit this page
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
        <div className="min-h-screen w-full relative flex items-center justify-center bg-background overflow-hidden selection:bg-primary/20 font-sans">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-indigo-500/20 via-pink-500/20 to-primary/20 blur-[120px] animate-pulse duration-[10s] delay-1000" />
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[100px] animate-pulse duration-[15s] delay-2000" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="absolute top-6 right-6 z-50">
                <ThemeSwitcher />
            </div>
            <div className="w-full max-w-5xl px-4 relative z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700">
                <div className="grid lg:grid-cols-5 gap-0 bg-card/80 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-[30px] overflow-hidden min-h-[600px]">
                    {/* Left Section - Branding & Info */}
                    <div className="lg:col-span-2 bg-muted/30 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
                        {/* Decorative Background for Left Panel */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />

                        <div className="relative z-10">
                            <Link
                                to="/"
                                className="inline-block mb-12 transition-transform hover:scale-105 active:scale-95 duration-200"
                            >
                                <img
                                    src={logo}
                                    alt={APP_TITLE}
                                    className="h-12 w-auto drop-shadow-sm"
                                />
                            </Link>

                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/50 text-foreground text-xs font-medium backdrop-blur-sm">
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                    <span>You're invited!</span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                                    Join the team on{' '}
                                    <span className="text-primary">
                                        {APP_TITLE}
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Collaborate, manage finances, and grow
                                    together. Your workspace is ready.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center border border-border/50">
                                    <Check className="w-4 h-4 text-green-500" />
                                </div>
                                <span>Secure invitation link</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center border border-border/50">
                                    <Check className="w-4 h-4 text-green-500" />
                                </div>
                                <span>Instant access setup</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Form */}
                    <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center bg-card/50 relative">
                        <div className="max-w-md mx-auto w-full">
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-foreground mb-2">
                                    Create your account
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Fill in your details to complete the setup.
                                </p>
                            </div>

                            <AcceptInvitationForm />

                            <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground">
                                <Link
                                    to="/login"
                                    className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                    Return to Login
                                </Link>
                                <div className="flex gap-5">
                                    <Link
                                        to="/privacy"
                                        className="hover:text-primary transition-colors"
                                    >
                                        Privacy
                                    </Link>
                                    <Link
                                        to="/terms"
                                        className="hover:text-primary transition-colors"
                                    >
                                        Terms
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="mt-8 text-center animate-in fade-in duration-700 delay-500">
                    <p className="text-xs text-muted-foreground/40 font-medium">
                        &copy; {new Date().getFullYear()} {APP_TITLE}. Securely
                        powered by Bkeep.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitationpage;
