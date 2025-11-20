import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FaBars, FaTimes } from 'react-icons/fa';
import Button from '../typography/Button';
import { APP_TITLE } from '../../constants';
import { logo } from '../../utills/image';

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`homepage-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex h-20 items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt={APP_TITLE}
                            className="h-10 w-auto object-contain"
                        />
                        <span
                            className={`text-xl font-bold transition-colors ${
                                isScrolled ? 'text-primary' : 'text-white'
                            }`}
                        >
                            {APP_TITLE}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-8 md:flex">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors ${
                                isScrolled
                                    ? 'text-primary-75 hover:text-primary'
                                    : 'text-white/80 hover:text-white'
                            }`}
                        >
                            Features
                        </Link>
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors ${
                                isScrolled
                                    ? 'text-primary-75 hover:text-primary'
                                    : 'text-white/80 hover:text-white'
                            }`}
                        >
                            Pricing
                        </Link>
                        <Link
                            to="/login"
                            className={`text-sm font-medium transition-colors ${
                                isScrolled
                                    ? 'text-primary-75 hover:text-primary'
                                    : 'text-white/80 hover:text-white'
                            }`}
                        >
                            Sign In
                        </Link>
                        <Link to="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg transition-colors ${
                            isScrolled
                                ? 'text-primary hover:bg-primary-10'
                                : 'text-white hover:bg-white/10'
                        }`}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <FaTimes className="h-6 w-6" />
                        ) : (
                            <FaBars className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="border-t border-primary-10 bg-white/95 backdrop-blur-md md:hidden">
                        <div className="flex flex-col gap-4 py-4">
                            <Link
                                to="/"
                                className="px-4 py-2 text-sm font-medium text-primary-75 hover:text-primary hover:bg-primary-10 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                to="/"
                                className="px-4 py-2 text-sm font-medium text-primary-75 hover:text-primary hover:bg-primary-10 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-medium text-primary-75 hover:text-primary hover:bg-primary-10 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="mx-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
