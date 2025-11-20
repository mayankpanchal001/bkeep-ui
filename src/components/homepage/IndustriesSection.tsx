import { APP_TITLE } from '../../constants';
import { INDUSTRIES } from './constants.tsx';

export default function IndustriesSection() {
    return (
        <section className="homepage-industries mx-auto max-w-6xl px-6 py-20">
            <div className="rounded-3xl bg-gradient-to-br from-primary-10 to-white px-8 py-16 shadow-lg border border-primary-10">
                <div className="mb-12 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70 mb-4">
                        Crafted for ambitious teams
                    </p>
                    <h2 className="text-3xl font-bold text-primary mb-4">
                        Whether you are local or scaling globally, {APP_TITLE}{' '}
                        adapts to your workflow.
                    </h2>
                    <p className="text-sm leading-relaxed text-primary-75 max-w-2xl mx-auto">
                        Lean businesses, creators, and venture-backed startups
                        trust {APP_TITLE} to automate their finances while
                        maintaining granular control and audit-ready accuracy.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-primary md:grid-cols-3">
                    {INDUSTRIES.map((industry) => (
                        <div
                            key={industry.name}
                            className="group flex items-center gap-3 rounded-xl border border-primary-10 bg-white px-5 py-4 text-primary shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary-25"
                        >
                            <div className="text-primary-50 group-hover:text-primary transition-colors">
                                {industry.icon}
                            </div>
                            <span className="font-medium">{industry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
