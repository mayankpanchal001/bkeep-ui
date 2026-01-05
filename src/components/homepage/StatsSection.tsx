import { PERFORMANCE_STATS } from './constants.tsx';

export default function StatsSection() {
    return (
        <section id="metrics" className="mx-auto max-w-6xl px-6 pb-16 pt-10">
            <div className="rounded-[32px] border border-border bg-gradient-to-br from-background via-muted/20 to-background p-8 shadow-sm">
                <div className="grid gap-6 text-center sm:grid-cols-3">
                    {PERFORMANCE_STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="group space-y-2 rounded-2xl border border-transparent bg-transparent px-6 py-4 transition-all hover:border-border hover:bg-muted/50"
                        >
                            <p className="text-4xl font-bold tracking-tight text-foreground transition-transform group-hover:scale-110">
                                {stat.value}
                            </p>
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
