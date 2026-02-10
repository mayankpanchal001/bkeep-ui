import { GithubIcon, LinkedinIcon, MailIcon, TwitterIcon } from 'lucide-react';
import { Link } from 'react-router';
import { APP_TITLE } from '../../constants';
import { logo } from '../../utills/image';
import { Button } from '../ui/button';

const footerLinks = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/' },
            { label: 'Blog', href: '/' },
            { label: 'Careers', href: '/' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Help Center', href: '/' },
            { label: 'Security', href: '/' },
            { label: 'Status', href: '/' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background pt-16 pb-8 lg:pt-24 lg:pb-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-12 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] lg:grid-cols-4 md:grid-cols-2">
                    {/* Brand Section */}
                    <div className="space-y-6 xl:col-span-1 lg:col-span-4 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src={logo}
                                alt={APP_TITLE}
                                className="h-8 w-auto"
                            />
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                {APP_TITLE}
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
                            The AI-first financial operating system for modern
                            firms. Automate bookkeeping, reconciliations, and
                            reporting with audit‑ready precision.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="/"
                                aria-label="Twitter"
                                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                            >
                                <TwitterIcon className="size-4" />
                            </a>
                            <a
                                href="/"
                                aria-label="LinkedIn"
                                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                            >
                                <LinkedinIcon className="size-4" />
                            </a>
                            <a
                                href="/"
                                aria-label="GitHub"
                                className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                            >
                                <GithubIcon className="size-4" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    {footerLinks.map((column) => (
                        <div key={column.title} className="flex flex-col gap-4">
                            <h3 className="text-sm font-medium text-foreground">
                                {column.title}
                            </h3>
                            <ul className="space-y-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-muted-foreground transition-colors hover:text-primary"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter Section */}
                    <div className="flex flex-col gap-4 xl:col-span-1 lg:col-span-4 md:col-span-2">
                        <h3 className="text-sm font-medium text-foreground">
                            Stay updated
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Get the latest product updates, accounting guides,
                            and industry news delivered to your inbox.
                        </p>
                        <form
                            className="mt-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative grow">
                                    <MailIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <Button
                                    variant="default"
                                    className="shrink-0"
                                    size="default"
                                    startIcon={<MailIcon className="w-4 h-4" />}
                                >
                                    Subscribe
                                </Button>
                            </div>
                            <p className="mt-2 text-[10px] text-muted-foreground">
                                By subscribing, you agree to our{' '}
                                <Link
                                    to="/"
                                    className="underline underline-offset-2 hover:text-foreground"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
                    <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
                        <p>
                            &copy; {new Date().getFullYear()} {APP_TITLE}, Inc.
                            All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link to="/" className="hover:text-foreground">
                                Privacy Policy
                            </Link>
                            <Link to="/" className="hover:text-foreground">
                                Terms of Service
                            </Link>
                            <Link to="/" className="hover:text-foreground">
                                Cookies Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
