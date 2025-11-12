import { FaArrowRight, FaCheckCircle, FaLaptopCode } from 'react-icons/fa';
import {
    FaCircleNodes,
    FaCreditCard,
    FaMoneyBillTrendUp,
} from 'react-icons/fa6';
import { APP_TITLE } from '../../constants';

const SOLUTION_FEATURES = [
    {
        title: 'AI-Automated Accounting',
        description:
            'Automate bank reconciliation, categorisation and reporting so your team stays focused on clients and growth.',
        icon: <FaCircleNodes className="text-primary" />,
    },
    {
        title: 'Global Invoicing & Payments',
        description:
            'Bill, collect, and reconcile in 150+ currencies with beautiful invoices and consolidated cash-flow visibility.',
        icon: <FaCreditCard className="text-primary" />,
    },
    {
        title: 'Real-time Spend Control',
        description:
            'Sync every card swipe and vendor bill automatically, approve expenses on the go, and keep budgets on track.',
        icon: <FaMoneyBillTrendUp className="text-primary" />,
    },
];

const STATS = [
    { label: 'Currencies Supported', value: '150+' },
    { label: 'Countries Using BKeep', value: '200+' },
    { label: 'Languages for Invoicing', value: '60+' },
    { label: 'Bank Connections', value: '25k+' },
];

const INDUSTRIES = [
    'Consulting',
    'Startups',
    'Creators & Freelancers',
    'Real Estate',
    'Construction',
    'Professional Services',
];

const VALUE_LIST = [
    'Native multi-currency ledger & FX translation',
    'AI-assisted cash flow forecasting & alerts',
    'Instant bank feed reconciliation with 90% accuracy',
    'Client billing, quotes, and recurring invoices in one workspace',
];

export default function Homepage() {
    return (
        <div className="min-h-screen bg-lightBg text-primary">
            {/* Hero */}
            <div className="relative isolate overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary-75/60 to-primary-10 opacity-85" />
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)]" />

                <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-24 text-white lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl space-y-6">
                        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                            Multi-currency. AI-powered. Built for small teams.
                        </p>
                        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Global accounting reimagined with {APP_TITLE}.
                        </h1>
                        <p className="text-base text-white/80 sm:text-lg">
                            Automate bookkeeping, manage invoices, and control
                            cash flow in real time. BKeep unifies everything
                            financial so your business can scale across borders
                            without growing your back-office costs.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <button className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg shadow-primary-10 transition hover:-translate-y-0.5 hover:shadow-xl">
                                Start for free
                            </button>
                            <button className="group inline-flex items-center gap-2 rounded-xl border border-white px-6 py-3 text-sm font-semibold text-white transition hover:border-white/80 hover:bg-white/5">
                                Book a guided demo
                                <FaArrowRight className="transition group-hover:translate-x-1" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-8 pt-6 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-white" /> No
                                credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-white" /> 14-day
                                full-feature trial
                            </div>
                        </div>
                    </div>
                    <div className="relative ml-auto w-full max-w-lg rounded-3xl bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-2xl bg-white/80 p-6 text-primary shadow-xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
                                Snapshot
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-primary">
                                The single source of financial truth.
                            </h3>
                            <p className="mt-3 text-sm text-primary-75">
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
                                        <FaCheckCircle className="mt-0.5 text-primary" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-2 gap-6 rounded-2xl border border-primary-10 bg-white p-8 shadow-sm md:grid-cols-4">
                    {STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="text-center md:text-left"
                        >
                            <p className="text-3xl font-bold text-primary">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-sm text-primary-50">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Solution Features */}
            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
                    <div className="space-y-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">
                            One platform, every workflow
                        </p>
                        <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                            Built for modern, distributed finance teams.
                        </h2>
                        <p className="text-base text-primary-75">
                            From invoices and expenses to AI-powered
                            reconciliation, {APP_TITLE} keeps your entire
                            back-office humming in sync. Consolidate operations
                            across entities and jurisdictions without hiring an
                            army of accountants.
                        </p>
                        <div className="grid gap-6">
                            {SOLUTION_FEATURES.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-primary-10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-10">
                                            {feature.icon}
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-primary-75">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-primary-10 bg-white p-8 shadow-lg">
                        <h3 className="text-xl font-semibold text-primary">
                            Why customers switch to {APP_TITLE}
                        </h3>
                        <ul className="mt-6 space-y-4">
                            {VALUE_LIST.map((value) => (
                                <li
                                    key={value}
                                    className="flex gap-3 text-sm text-primary-75"
                                >
                                    <FaCheckCircle className="mt-1 text-primary" />
                                    <span>{value}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 rounded-2xl bg-primary-10 p-6 text-sm text-primary">
                            <p className="font-semibold">
                                “{APP_TITLE} takes the headache out of
                                multi-entity accounting. We closed the month 3×
                                faster once we automated reconciliation and
                                billing in one place.”
                            </p>
                            <p className="mt-4 text-xs text-primary-50">
                                Jan Kutscher, CEO at True Brew Birdie Ltd.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Industries */}
            <section className="mx-auto max-w-6xl px-6 pb-16">
                <div className="rounded-3xl bg-white px-8 py-12 shadow-lg">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-xl space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
                                Crafted for ambitious teams
                            </p>
                            <h2 className="text-3xl font-bold text-primary">
                                Whether you are local or scaling globally,{' '}
                                {APP_TITLE} adapts to your workflow.
                            </h2>
                            <p className="text-sm text-primary-75">
                                Lean businesses, creators, and venture-backed
                                startups trust {APP_TITLE} to automate their
                                finances while maintaining granular control and
                                audit-ready accuracy.
                            </p>
                        </div>
                        <div className="grid w-full grid-cols-2 gap-4 text-sm text-primary md:grid-cols-3">
                            {INDUSTRIES.map((industry) => (
                                <div
                                    key={industry}
                                    className="flex items-center gap-2 rounded-xl border border-primary-10 bg-white px-4 py-3 text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <FaLaptopCode className="text-primary" />
                                    {industry}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-6xl px-6 pb-20">
                <div className="rounded-3xl border border-primary-10 bg-gradient-to-r from-primary to-primary-75 p-10 text-white shadow-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/70">
                                Get started today
                            </p>
                            <h2 className="text-3xl font-bold">
                                Build a beautiful relationship with your
                                finances.
                            </h2>
                            <p className="text-sm text-white/80">
                                Launch in minutes, invite your accountant, and
                                see why global teams are leaving legacy
                                accounting suites behind for a modern, automated
                                platform.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <button className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl">
                                Start for free
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                                Talk to sales{' '}
                                <FaArrowRight className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
