import { INVEST_FEATURES } from './constants.tsx';

export default function FeaturesSection() {
    return (
        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">
                        Automate your accounting
                    </p>
                    <h2 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                        AI‑powered bookkeeping and reporting with enterprise
                        controls.
                    </h2>
                    <p className="text-base text-muted-foreground">
                        From bank feeds to financial statements, BKeep
                        streamlines categorization, journal entries,
                        reconciliations, and audits.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {INVEST_FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-3xl border border-border bg-gradient-to-b from-muted/40 to-transparent p-4 "
                        >
                            <span className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
                                {feature.tag}
                            </span>
                            <h3 className="mt-3 text-lg font-semibold text-foreground">
                                {feature.title}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
