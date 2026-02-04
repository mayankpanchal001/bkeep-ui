import { ChevronRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { APP_TITLE } from '../../constants';
import { logo } from '../../utills/image';
import { Button } from '../ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet';

const NAV_LINKS = [
    {
        label: 'Features',
        href: '#features',
        description: 'Explore what we offer',
    },
    { label: 'Benefits', href: '#benefits', description: 'Why choose us' },
    { label: 'Pricing', href: '#pricing', description: 'Plans for every team' },
    {
        label: 'Testimonials',
        href: '#testimonials',
        description: 'What our users say',
    },
    { label: 'FAQ', href: '#faq', description: 'Common questions answered' },
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
            className={`homepage-nav fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300 ${isScrolled
                ? 'bg-background/80 backdrop-blur-md shadow-sm'
                : 'bg-transparent border-transparent'
                }`}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                <Link to="/" className="flex items-center gap-3 z-50">
                    <img
                        src={logo}
                        alt={APP_TITLE}
                        className="h-10 w-auto object-contain"
                    />
                    <span className="text-base font-bold uppercase tracking-widest text-foreground hidden sm:block">
                        {APP_TITLE}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-1 text-sm font-medium md:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="group relative px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                            <span className="absolute inset-x-4 -bottom-px h-px bg-linear-to-r from-primary/0 via-primary/70 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </a>
                    ))}

                    <div className="ml-4 flex items-center gap-3 pl-4 border-l border-border/50">

                        <Link to="/login">
                            <Button
                                size="sm"
                                className="rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
                            >
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet
                        open={isMobileMenuOpen}
                        onOpenChange={setIsMobileMenuOpen}
                    >
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden relative z-50 hover:bg-transparent"
                                aria-label="Open menu"
                            >
                                <Menu className="h-8 w-8 stroke-[1.5]" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="top"
                            className="w-full h-[100dvh] border-none bg-background/95 backdrop-blur-2xl p-0 data-[state=open]:duration-500 data-[state=closed]:duration-300 [&>button]:hidden"
                        >
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="flex h-20 items-center justify-between px-6 border-b border-border/10">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={logo}
                                            alt={APP_TITLE}
                                            className="h-10 w-auto object-contain"
                                        />
                                        <span className="text-base font-bold uppercase tracking-widest">
                                            {APP_TITLE}
                                        </span>
                                    </div>
                                    <SheetClose asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-muted/50 rounded-full"
                                        >
                                            <X className="h-8 w-8 stroke-[1.5]" />
                                            <span className="sr-only">
                                                Close menu
                                            </span>
                                        </Button>
                                    </SheetClose>
                                </div>

                                {/* Menu Links */}
                                <div className="flex-1 overflow-y-auto px-6 py-8">
                                    <div className="flex flex-col gap-2">
                                        {NAV_LINKS.map((link, index) => (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                                className="group flex items-center justify-between py-4 border-b border-border/40 last:border-0"
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-2xl font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                        {link.label}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {link.description}
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 bg-muted/30 border-t border-border/50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link
                                            to="/login"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full h-12 text-base font-medium rounded-xl border-border/60 hover:bg-background hover:border-primary/50 transition-all"
                                            >
                                                Sign in
                                            </Button>
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="w-full"
                                        >
                                            <Button
                                                size="default"
                                                className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20"
                                            >
                                                Get Started
                                            </Button>
                                        </Link>
                                    </div>
                                    <p className="mt-6 text-center text-xs text-muted-foreground/60">
                                        © {new Date().getFullYear()}{' '}
                                        {APP_TITLE}. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
