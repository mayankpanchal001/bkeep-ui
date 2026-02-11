import { PERFORMANCE_STATS } from './constants.tsx';

export default function StatsSection() {
    return (
        <section id="metrics" className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
                    Performance Metrics
                </p>
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Proven results for accounting teams
                </h2>
                <p className="text-lg text-muted-foreground">
                    Join thousands of bookkeepers and accountants who have
                    transformed their workflow with BKeep.
                </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
                {PERFORMANCE_STATS.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="group relative overflow-hidden rounded-2xl border border-border bg-background p-8 text-center shadow-sm transition-all hover:shadow-lg"
                    >
                        {/* Subtle hover gradient */}
                        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                        <p className="mb-3 text-5xl font-bold tracking-tight text-foreground transition-transform group-hover:scale-105">
                            {stat.value}
                        </p>
                        <p className="text-base font-medium text-muted-foreground">
                            {stat.label}
                        </p>

                        {/* Bottom accent line on hover */}
                        <div
                            className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-primary/50 to-primary opacity-0 transition-opacity group-hover:opacity-100"
                            style={{
                                transitionDelay: `${index * 50}ms`,
                            }}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
