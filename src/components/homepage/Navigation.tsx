import { LogIn, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router';
import { APP_TITLE } from '../../constants';
import { logo } from '../../utills/image';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
];

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`homepage-nav fixed top-0 left-0 right-0 z-50 border-b border-border transition-colors duration-300 ${
                isScrolled
                    ? 'bg-background/90 backdrop-blur-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt={APP_TITLE}
                        className="h-9 w-auto object-contain"
                    />
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground">
                        {APP_TITLE}
                    </span>
                </Link>

                <div className="hidden items-center gap-8 text-sm md:flex">
                    {NAV_LINKS.map((link) => (
                        <Tooltip key={link.label}>
                            <TooltipTrigger asChild>
                                <a
                                    href={link.href}
                                    className="text-muted-foreground transition hover:text-foreground"
                                >
                                    {link.label}
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>{link.label}</TooltipContent>
                        </Tooltip>
                    ))}

                    <Link to="/login">
                        <Button
                            variant="default"
                            size="default"
                            tooltip="Sign in to your account"
                            startIcon={<LogIn className="w-4 h-4" />}
                        >
                            Sign in
                        </Button>
                    </Link>
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            className="rounded-lg p-2 text-foreground md:hidden"
                            aria-label="Toggle navigation"
                        >
                            {isMobileMenuOpen ? (
                                <FaTimes className="h-6 w-6" />
                            ) : (
                                <FaBars className="h-6 w-6" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    </TooltipContent>
                </Tooltip>
            </div>

            {isMobileMenuOpen && (
                <div className="border-t border-border bg-background px-6 py-6 md:hidden">
                    <div className="flex flex-col gap-4 text-muted-foreground">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
                            >
                                {link.label}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-lg px-4 py-2 text-center text-sm font-semibold"
                        >
                            <Button
                                variant="default"
                                size="default"
                                startIcon={<Plus className="w-4 h-4" />}
                            >
                                Get started
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
