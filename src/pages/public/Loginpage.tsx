import { LoginForm } from '@/components/auth/LoginForm';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';
import { Link } from 'react-router';
import { logo } from '../../utills/image';

const Loginpage = () => {
    return (
        <div className="grid h-dvh justify-center p-2 lg:grid-cols-2 overflow-hidden relative bg-lightBg">
            {/* Left Side - Login Form Section */}
            <div className="flex items-center justify-center h-full relative z-10 bg-transparent">
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
                            <h2 className="text-[24px] font-semibold leading-tight text-primary mb-1.5 tracking-tight">
                                Login to your account
                            </h2>
                            <p className="text-[14px] text-primary/60 font-medium">
                                Please enter your details to login.
                            </p>
                        </div>
                        <LoginForm />
                    </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                    <p className="text-[12px] text-primary/60 font-medium tracking-tight">
                        © 2025, Bkeep Accounting.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/privacy"
                            className="text-[12px] text-primary/60 font-medium hover:text-primary transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className="text-[12px] text-primary/60 font-medium hover:text-primary transition-colors"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Branding Section */}
            <div className="hidden lg:flex p-1 h-full">
                <div className="w-full bg-white rounded-[24px] p-10 relative overflow-hidden h-full">
                    <div className="relative z-10 w-full flex flex-col items-start">
                        <div className="mb-4">
                            <img
                                src={logo}
                                alt="Bkeep Logo"
                                className="h-24 w-24 object-contain"
                            />
                        </div>
                        <h1 className="text-[30px] font-semibold leading-[36px] text-primary mb-2 tracking-tight">
                            Bkeep Accounting
                        </h1>
                        <p className="text-[16px] text-primary/60 font-medium tracking-tight">
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
                                <h3 className="text-primary text-[16px] font-semibold">
                                    Ready to launch?
                                </h3>
                                <p className="text-primary/60 text-[14px] leading-relaxed">
                                    Clone the repo, install dependencies, and
                                    your dashboard is live in minutes.
                                </p>
                            </div>

                            {/* Right Section */}
                            <div className="pl-6">
                                <h3 className="text-primary text-[16px] font-semibold">
                                    Need help?
                                </h3>
                                <p className="text-primary/60 text-[14px] leading-relaxed">
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
