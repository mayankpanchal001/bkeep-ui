import { APP_TITLE } from '../../constants';
import { SOLUTION_FEATURES } from './constants';

export default function FeaturesSection() {
    return (
        <section className="homepage-features mx-auto max-w-6xl px-6 py-20">
            <div className="mb-12 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70 mb-4">
                    One platform, every workflow
                </p>
                <h2 className="text-3xl font-bold text-primary sm:text-4xl lg:text-5xl mb-4">
                    Built for modern, distributed finance teams.
                </h2>
                <p className="text-base leading-relaxed text-primary-75 max-w-2xl mx-auto">
                    From invoices and expenses to AI-powered reconciliation,
                    {APP_TITLE} keeps your entire back-office humming in sync.
                    Consolidate operations across entities and jurisdictions
                    without hiring an army of accountants.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {SOLUTION_FEATURES.map((feature) => (
                    <div
                        key={feature.title}
                        className="group relative rounded-2xl border border-primary-10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary-25 overflow-hidden"
                    >
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        />
                        <div className="relative">
                            <div className="flex items-start gap-4">
                                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-25">
                                    {feature.icon}
                                </span>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-primary mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-primary-75">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
