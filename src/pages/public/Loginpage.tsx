import { Link } from 'react-router';
import { LoginForm } from '../../components/auth/LoginForm';
import { logo } from '../../utills/image';

const Loginpage = () => {
    return (
        <div className="h-screen flex w-full overflow-hidden">
            {/* Left Side - Login Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#FFFFFF] p-4 lg:p-12 h-screen relative">
                <div className="w-full max-w-md">
                    {/* Mobile Logo - Only visible on small screens */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        <img
                            src={logo}
                            alt="BKeep Accounting Logo"
                            className="h-12 w-auto mb-4"
                        />
                    </div>

                    {/* Login Form Card */}
                    <div className="bg-white p-8 lg:p-12 rounded-[24px]">
                        <div className="mb-12 text-center">
                            <h2 className="text-[30px] font-semibold leading-[36px] text-gray-900 mb-2 tracking-tight">
                                Login to your account
                            </h2>
                            <p className="text-[14px] text-gray-400 font-medium">
                                Please enter your details to login
                            </p>
                        </div>
                        <LoginForm />
                    </div>
                </div>

                {/* Left Center Copyright - Bottom End */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-[12px] text-gray-900 font-semibold tracking-tight">
                        © 2025 Bkeep Accounting All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Side - Branding Section */}
            <div className="hidden lg:flex lg:w-1/2 p-2 bg-white min-h-screen">
                <div className="w-full bg-black rounded-[20px] p-20 relative overflow-hidden">
                    <div className="relative z-10 w-full flex flex-col items-start">
                        <div className="mb-4">
                            <img
                                src={logo}
                                alt="Bkeep Logo"
                                className="h-16 w-auto object-contain brightness-0 invert"
                            />
                        </div>
                        <h1 className="text-[32px] font-semibold leading-[38px] text-[#FAFAFA] mb-2 tracking-tight">
                            Bkeep Accounting
                        </h1>
                        <p className="text-[16px] text-[#FAFAFA] font-medium tracking-tight">
                            Manage. Track. Grow. Succeed.
                        </p>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
                        {/* Legal Links - Bottom Center */}
                        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#FAFAFA]">
                            <Link
                                to="/privacy"
                                className="hover:underline transition-all duration-300"
                            >
                                Privacy Policy
                            </Link>
                            <span className="mx-1">·</span>
                            <Link
                                to="/terms"
                                className="hover:underline transition-all duration-300"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loginpage;
