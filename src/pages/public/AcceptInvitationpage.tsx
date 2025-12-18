import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import AcceptInvitationForm from '../../components/auth/AcceptInvitationForm';
import { APP_TITLE } from '../../constants';
import { logo } from '../../utills/image';

const AcceptInvitationpage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Branding Section */}
            <div className="hidden lg:flex lg:w-1/2  bg-gradient-to-br from-primary to-primary-75 items-center justify-center p-12 relative overflow-hidden">
                {/* Background Pattern Layer 1 - Grid */}
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="absolute inset-0 animate-pattern-grid"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>
                {/* Background Pattern Layer 2 - Dots */}
                <div className="absolute inset-0 opacity-15">
                    <div
                        className="absolute inset-0 animate-pattern-dots"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)',
                            backgroundSize: '40px 40px',
                            backgroundPosition: '20px 20px',
                        }}
                    />
                </div>
                {/* Background Pattern Layer 3 - Diagonal Lines */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0 animate-pattern-diagonal"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 10px,
                                rgba(255, 255, 255, 0.1) 10px,
                                rgba(255, 255, 255, 0.1) 20px
                            )`,
                            backgroundSize: '28px 28px',
                        }}
                    />
                </div>
                <div className="relative z-10 w-full text-center">
                    <div className="flex items-center justify-center">
                        <img
                            src={logo}
                            alt="BKeep Accounting Logo"
                            className="h-20 aspect-[3/4] bg-lightBg p-4 rounded-sm mb-8 drop-shadow-lg object-contain"
                        />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Welcome to {APP_TITLE}
                    </h1>
                    <p className="text-lg text-white/90 mb-8">
                        You've been invited! Complete your account setup and
                        join your team to start managing accounting with ease.
                    </p>
                    <div className="flex flex-col gap-4 text-white/80 text-sm">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/60"></div>
                            <span>Secure & Encrypted</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/60"></div>
                            <span>Team Collaboration</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/60"></div>
                            <span>Cloud-Based Platform</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Accept Invitation Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-lightBg p-6 lg:p-12 overflow-auto min-h-screen">
                <div className="w-full max-w-md">
                    {/* Mobile Logo - Only visible on small screens */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <Link to="/">
                            <img
                                src={logo}
                                alt="BKeep Accounting Logo"
                                className="h-16 w-auto mb-4"
                            />
                        </Link>
                        <h1 className="text-2xl font-bold text-primary mb-2">
                            Welcome to {APP_TITLE}
                        </h1>
                        <p className="text-sm text-primary-75 text-center">
                            Complete your account setup to get started
                        </p>
                    </div>

                    {/* Accept Invitation Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-primary-10">
                        <AcceptInvitationForm />
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-primary-50 mt-2">
                            © {new Date().getFullYear()} {APP_TITLE}. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitationpage;
