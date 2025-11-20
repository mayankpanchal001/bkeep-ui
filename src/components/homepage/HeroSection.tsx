import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router';
import { APP_TITLE } from '../../constants';
import Button from '../typography/Button';

export default function HeroSection() {
    return (
        <div className="homepage-hero relative isolate overflow-hidden pt-20">
            {/* Background Pattern Layers */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary-75/60 to-primary-10 opacity-85" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)]" />

            {/* Animated Pattern Overlays */}
            <div className="absolute inset-0 -z-10 opacity-10">
                <div
                    className="absolute inset-0 animate-pattern-grid"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-32 pt-24 text-white lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-6">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm border border-white/20">
                        ✨ Multi-currency. AI-powered. Built for small teams.
                    </p>
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Global accounting reimagined with{' '}
                        <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                            {APP_TITLE}
                        </span>
                        .
                    </h1>
                    <p className="text-base leading-relaxed text-white/80 sm:text-lg">
                        Automate bookkeeping, manage invoices, and control cash
                        flow in real time. {APP_TITLE} unifies everything
                        financial so your business can scale across borders
                        without growing your back-office costs.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link to="/register">
                            <Button variant="primary" size="lg">
                                Start for free
                            </Button>
                        </Link>
                        <button className="group inline-flex items-center gap-2 rounded-xl border border-white/80 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10 hover:-translate-y-0.5 backdrop-blur-sm">
                            Book a guided demo
                            <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-8 pt-6 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-white shrink-0" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-white shrink-0" />
                            <span>14-day full-feature trial</span>
                        </div>
                    </div>
                </div>
                <div className="relative ml-auto w-full max-w-lg">
                    <div className="rounded-3xl bg-white/10 p-6 shadow-2xl backdrop-blur-xl border border-white/20">
                        <div className="rounded-2xl bg-white/95 p-6 text-primary shadow-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
                                    Live Dashboard
                                </p>
                            </div>
                            <h3 className="mt-2 text-2xl font-bold text-primary">
                                The single source of financial truth.
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-primary-75">
                                Real-time dashboard highlighting cash flow, bank
                                balances, outstanding invoices, and AI-driven
                                insights so you can make decisions with
                                confidence.
                            </p>
                            <div className="mt-6 space-y-4 text-sm">
                                {[
                                    'Automated bank feeds across global accounts',
                                    'Smart spend alerts and approvals',
                                    'Team collaboration with audit-ready trail',
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-2 text-primary"
                                    >
                                        <FaCheckCircle className="mt-0.5 text-primary shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
