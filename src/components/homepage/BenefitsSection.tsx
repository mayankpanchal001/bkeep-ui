import { CAPABILITY_FEATURES } from './constants.tsx';

export default function BenefitsSection() {
    return (
        <section id="benefits" className="mx-auto max-w-6xl px-6 py-20">
            <div className="space-y-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">
                    Modern accounting starts here
                </p>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                    Control every ledger—transactions, journals, invoices—in one
                    platform.
                </h2>
                <p className="text-base text-muted-foreground">
                    Accurate books, automated workflows, and proactive insights
                    for teams and companies.
                </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
                {CAPABILITY_FEATURES.map((feature) => (
                    <div
                        key={feature.title}
                        className="rounded-[28px] border border-border bg-background p-4 shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
                    >
                        <span className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                            {feature.metric}
                        </span>
                        <h3 className="mt-3 text-xl font-semibold text-foreground">
                            {feature.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {feature.description}
                        </p>
                        <button className="mt-6 text-sm font-semibold text-primary transition hover:text-foreground">
                            Learn more →
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
