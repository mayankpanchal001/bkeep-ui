import { useEffect } from 'react';
import { Link } from 'react-router';
import Button from '../typography/Button';
import { HERO_METRICS } from './constants.tsx';

export default function HeroSection() {
    useEffect(() => {
        localStorage.setItem(
            'passkeyUser',
            JSON.stringify({
                email: 'user@example.com',
                lastAccessed: 'Nov 21, 2025',
                device: 'Chrome on Windows',
            })
        );
    }, []);
    return (
        <section className="relative isolate overflow-hidden bg-background pt-28 text-foreground">
            <div className="absolute inset-0 -z-10 opacity-60">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-muted/20 to-background" />
                <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
            </div>
            <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
                <div className="space-y-8">
                    <span className="inline-flex items-center rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                        AI Accounting Platform
                    </span>
                    <div className="space-y-6">
                        <h1 className="text-4xl font-semibold leading-[1.15] text-foreground sm:text-5xl lg:text-[56px]">
                            Automate bookkeeping, close faster, stay
                            audit‑ready.
                        </h1>
                        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                            BKeep categorizes transactions, reconciles accounts,
                            and generates real‑time financial statements with
                            AI—across tenants and clients.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/register">
                            <Button variant="primary" className="px-8">
                                Get started
                            </Button>
                        </Link>
                        <Button variant="outline" className="border-border">
                            See how it works
                        </Button>
                    </div>
                    <div className="grid gap-4 rounded-2 border border-border bg-muted p-4 backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">
                            Performance you can measure
                        </p>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {HERO_METRICS.map((metric) => (
                                <div key={metric.label} className="space-y-1.5">
                                    <p className="text-2xl font-semibold text-foreground">
                                        {metric.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {metric.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="relative rounded-[32px] border border-border bg-background/80 p-6 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Financial Overview</span>
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                </span>
                                <span>Live Updates</span>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="rounded-2xl border border-border bg-muted/50 p-5 transition-colors hover:bg-muted/70">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Net Income (YTD)
                                        </p>
                                        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                                            $142,500.00
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500">
                                        +12.4%
                                    </span>
                                </div>
                                <div className="mt-4 h-16 w-full overflow-hidden rounded-lg bg-background/50">
                                    <svg
                                        viewBox="0 0 100 20"
                                        className="h-full w-full stroke-primary/50"
                                        fill="none"
                                    >
                                        <path
                                            d="M0 15 Q 10 10, 20 14 T 40 10 T 60 5 T 80 12 T 100 8"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M0 15 Q 10 10, 20 14 T 40 10 T 60 5 T 80 12 T 100 8 V 20 H 0 Z"
                                            className="fill-primary/5"
                                            stroke="none"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-muted/50 p-5 transition-colors hover:bg-muted/70">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Pending Review
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-foreground">
                                        12 Items
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Needs attention
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border bg-muted/50 p-5 transition-colors hover:bg-muted/70">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Cash on Hand
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-foreground">
                                        $1.2M
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Across 3 accounts
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-6 -left-8 hidden w-48 rounded-2xl border border-border bg-background p-5 shadow-xl backdrop-blur lg:block">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="h-8 w-8 rounded-full border-2 border-background bg-gray-300"></div>
                                <div className="h-8 w-8 rounded-full border-2 border-background bg-gray-400"></div>
                                <div className="h-8 w-8 rounded-full border-2 border-background bg-gray-500"></div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">
                                    1.2k+
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    Trusted Firms
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
