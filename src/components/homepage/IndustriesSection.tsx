import { OUTCOME_CARDS } from './constants.tsx';

export default function IndustriesSection() {
    return (
        <section className="mx-auto max-w-6xl px-6 pb-20">
            <div className="flex flex-col gap-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
                    Built for firms, finance teams, and startups
                </p>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                    One workspace per company with roles, approvals, and audit
                    trails.
                </h2>
                <p className="text-base text-muted-foreground">
                    Collaborate securely across companies while maintaining
                    clean separation of data.
                </p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
                {OUTCOME_CARDS.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-3xl border border-border bg-gradient-to-br from-muted to-transparent p-4"
                    >
                        <h3 className="text-xl font-semibold text-foreground">
                            {card.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {card.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
