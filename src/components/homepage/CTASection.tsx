import { CircleCheckIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../ui/button';

export default function CTASection() {
    return (
        <section className="mx-auto max-w-6xl px-6 pb-24">
            <div className="relative overflow-hidden rounded-[32px] border border-border bg-background px-8 py-12 text-foreground shadow-xs">
                <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="space-y-4 text-center md:text-left">
                        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">
                            Start modern accounting today
                        </p>
                        <h2 className="text-3xl font-semibold sm:text-4xl">
                            Automate bookkeeping, close faster, stay
                            audit‑ready.
                        </h2>
                        <p className="text-base text-muted-foreground">
                            Launch in minutes, invite your team, and see why
                            firms trust BKeep for AI categorization,
                            reconciliations, and real‑time statements.
                        </p>
                        <div className="flex flex-col items-center justify-start gap-4 pt-4 sm:flex-row">
                            <Link to="/register">
                                <Button
                                    variant="default"
                                    className="bg-card text-foreground hover:bg-card/90"
                                >
                                    Get started
                                </Button>
                            </Link>
                            <Link to="#pricing">
                                <Button
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-muted/20"
                                >
                                    View pricing
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="border-border text-foreground hover:bg-muted/20"
                            >
                                Talk to sales
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded bg-primary/20 p-4">
                            <CircleCheckIcon className="size-4" />
                            <div>
                                <p className="text-sm font-medium">
                                    AI categorization
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    High‑accuracy mapping to chart of accounts.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded bg-primary/20 p-4">
                            <CircleCheckIcon className="size-4" />
                            <div>
                                <p className="text-sm font-medium">
                                    Guided reconciliations
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Match feeds quickly with audit logs.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded bg-primary/20 p-4">
                            <CircleCheckIcon className="size-4" />
                            <div>
                                <p className="text-sm font-medium">
                                    Smart journals
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Multi‑line entries with approvals.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded bg-primary/20 p-4">
                            <CircleCheckIcon className="size-4" />
                            <div>
                                <p className="text-sm font-medium">
                                    Real‑time statements
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Instant income and balance sheets.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
