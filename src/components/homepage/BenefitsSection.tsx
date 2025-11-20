import { FaCheckCircle } from 'react-icons/fa';
import { APP_TITLE } from '../../constants';
import { TESTIMONIAL, VALUE_LIST } from './constants.tsx';

export default function BenefitsSection() {
    return (
        <section className="homepage-benefits mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">
                        Why choose {APP_TITLE}
                    </p>
                    <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                        Everything you need to scale your finances.
                    </h2>
                    <p className="text-base leading-relaxed text-primary-75">
                        Join thousands of businesses that trust {APP_TITLE} to
                        automate their accounting workflows and gain real-time
                        insights into their financial health.
                    </p>
                    <div className="grid gap-4">
                        {VALUE_LIST.map((value) => (
                            <div
                                key={value}
                                className="flex items-start gap-3 rounded-xl border border-primary-10 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary-25"
                            >
                                <FaCheckCircle className="mt-0.5 text-primary shrink-0" />
                                <span className="text-sm text-primary-75">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-3xl border border-primary-10 bg-white p-8 shadow-lg">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-10 w-10 rounded-full bg-primary-10 flex items-center justify-center text-xl">
                                {TESTIMONIAL.avatar}
                            </div>
                            <div>
                                <p className="font-semibold text-primary">
                                    {TESTIMONIAL.author}
                                </p>
                                <p className="text-xs text-primary-50">
                                    {TESTIMONIAL.role}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={`star-${i}`}
                                    className="text-yellow-400"
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-primary-75 italic">
                        "{TESTIMONIAL.quote}"
                    </p>
                </div>
            </div>
        </section>
    );
}
