import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';
import { HERO_METRICS } from './constants.tsx';
import { GSAPMagneticElement } from './GSAPAnimations';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-background pb-16 pt-32 md:pb-24 md:pt-40">
            {/* Subtle background gradient - very minimal */}
            <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 via-background to-background" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Main hero content - centered and bold */}
                <div className="mx-auto max-w-4xl text-center">
                    {/* Small badge */}
                    <GSAPMagneticElement strength={0.2}>
                        <div className="mb-8 inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted">
                            <span className="mr-2 flex h-2 w-2">
                                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                            </span>
                            AI-Powered Accounting Platform
                        </div>
                    </GSAPMagneticElement>

                    {/* Bold, clear headline - Double style */}
                    <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        Close the books in{' '}
                        <span className="text-primary">half the time</span>
                    </h1>

                    {/* Simple, clear description */}
                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                        BKeep is the leading AI-powered bookkeeping platform.
                        Automate transaction categorization, reconciliations,
                        and generate real-time financial statements across
                        multiple companies.
                    </p>

                    {/* Clear CTA buttons with magnetic effect */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <GSAPMagneticElement strength={0.15}>
                            <Link to="/register">
                                <Button
                                    size="lg"
                                    className="group min-w-[200px] gap-2 px-8"
                                >
                                    Get Started
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </GSAPMagneticElement>
                        <GSAPMagneticElement strength={0.15}>
                            <Link to="/login">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="min-w-[200px] px-8"
                                >
                                    Book a Demo
                                </Button>
                            </Link>
                        </GSAPMagneticElement>
                    </div>

                    {/* Social proof rating */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className="h-4 w-4 fill-primary text-primary"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="font-medium">5.0</span>
                        <span>from 200+ reviews</span>
                    </div>
                </div>

                {/* Key metrics - clean card style */}
                <div className="mx-auto mt-16 max-w-5xl md:mt-24">
                    <div className="grid gap-6 sm:grid-cols-3">
                        {HERO_METRICS.map((metric, index) => (
                            <div
                                key={metric.label}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                {/* Subtle hover gradient */}
                                <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                <div className="space-y-2">
                                    <p className="text-3xl font-bold text-foreground md:text-4xl">
                                        {metric.value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {metric.label}
                                    </p>
                                </div>

                                {/* Subtle accent line */}
                                <div
                                    className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-primary/50 to-primary opacity-0 transition-opacity group-hover:opacity-100"
                                    style={{
                                        transitionDelay: `${index * 50}ms`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero image/dashboard preview - clean mockup with magnetic hover */}
                <div className="mx-auto mt-16 max-w-6xl md:mt-24">
                    <GSAPMagneticElement strength={0.05}>
                        <div className="relative rounded-2xl border border-border bg-linear-to-b from-muted/50 to-muted/30 p-4 shadow-2xl backdrop-blur-sm transition-shadow hover:shadow-3xl md:p-8">
                            {/* Browser chrome mockup */}
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="ml-4 flex-1 rounded bg-background/50 px-4 py-1.5 text-xs text-muted-foreground">
                                    app.bkeep.com/dashboard
                                </div>
                            </div>

                            {/* Dashboard content preview */}
                            <div className="overflow-hidden rounded-lg border border-border bg-background">
                                <div className="space-y-4 p-6">
                                    {/* Header with live indicator */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-foreground">
                                            Financial Overview
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                            </span>
                                            <span>Live Updates</span>
                                        </div>
                                    </div>

                                    {/* Main metric card */}
                                    <div className="rounded-xl border border-border bg-muted/30 p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Net Income (YTD)
                                                </p>
                                                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
                                                    $142,500
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
                                                +12.4%
                                            </span>
                                        </div>

                                        {/* Simple chart visualization */}
                                        <div className="mt-6 h-20 w-full overflow-hidden rounded-lg bg-background/50">
                                            <svg
                                                viewBox="0 0 100 20"
                                                className="h-full w-full stroke-primary"
                                                fill="none"
                                            >
                                                <path
                                                    d="M0 15 Q 10 10, 20 14 T 40 10 T 60 5 T 80 12 T 100 8"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M0 15 Q 10 10, 20 14 T 40 10 T 60 5 T 80 12 T 100 8 V 20 H 0 Z"
                                                    className="fill-primary/10"
                                                    stroke="none"
                                                />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Quick stats grid */}
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Pending Review
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-foreground">
                                                12
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Reconciled
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-foreground">
                                                98%
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-muted/20 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                Cash Balance
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-foreground">
                                                $1.2M
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GSAPMagneticElement>
                </div>
            </div>
        </section>
    );
}
