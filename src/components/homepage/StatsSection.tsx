import { STATS } from './constants.tsx';

export default function StatsSection() {
    return (
        <section className="homepage-stats mx-auto max-w-6xl px-6 py-16 -mt-16 relative z-10">
            <div className="grid grid-cols-2 gap-6 rounded-3xl border border-primary-10 bg-white p-8 shadow-lg md:grid-cols-4">
                {STATS.map((stat) => (
                    <div
                        key={stat.label}
                        className="group text-center transition-all duration-300 hover:scale-105 md:text-left"
                    >
                        <div className="flex items-center justify-center gap-3 mb-2 md:justify-start">
                            <div className="text-primary-50 group-hover:text-primary transition-colors">
                                {stat.icon}
                            </div>
                            <p className="text-3xl font-bold text-primary">
                                {stat.value}
                            </p>
                        </div>
                        <p className="mt-1 text-sm text-primary-50">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
