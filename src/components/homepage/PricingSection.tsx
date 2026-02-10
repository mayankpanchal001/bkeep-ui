import { PRICING_PLANS } from './constants.tsx';

const PricingSection = () => {
    return (
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
            <div className="flex flex-col gap-4 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.45em] text-muted-foreground">
                    Pricing options
                </p>
                <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
                    Choose the subscription that fits your strategy.
                </h2>
                <p className="text-base text-muted-foreground">
                    Monthly or annual billing, transparent fees, and dedicated
                    onboarding for every workspace.
                </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
                {PRICING_PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`rounded-3xl border border-border p-8 ${plan.highlight
                                ? 'bg-gradient-to-br from-primary/15 via-muted/20 to-background'
                                : 'bg-background'
                            }`}
                    >
                        {plan.highlight && (
                            <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
                                {plan.highlight}
                            </span>
                        )}
                        <div className="mt-4 flex items-end gap-3">
                            <p className="text-4xl font-medium text-foreground">
                                {plan.price}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {plan.cadence}
                            </p>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            {plan.description}
                        </p>
                        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                            {plan.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="rounded border border-border bg-muted/30 px-4 py-2"
                                >
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button className="mt-6 w-full rounded border border-border bg-muted py-3 text-sm font-medium text-foreground transition hover:bg-muted/80">
                            {plan.name === 'Core'
                                ? 'Get started'
                                : 'Upgrade now'}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PricingSection;
