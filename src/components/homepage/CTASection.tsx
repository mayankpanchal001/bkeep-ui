import { Link } from 'react-router';
import Button from '../typography/Button';

export default function CTASection() {
    return (
        <section className="homepage-cta mx-auto max-w-6xl px-6 pb-20">
            <div className="relative rounded-3xl border border-primary-10 bg-gradient-to-r from-primary to-primary-75 p-12 text-white shadow-xl overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0 animate-pattern-dots"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.5) 1px, transparent 0)',
                            backgroundSize: '40px 40px',
                            backgroundPosition: '20px 20px',
                        }}
                    />
                </div>
                <div className="relative flex flex-col gap-8 lg:items-center lg:justify-between">
                    <div className="max-w-2xl space-y-4">
                        <p className="text-xs text-center font-semibold uppercase tracking-[0.45em] text-white/70">
                            Get started today
                        </p>
                        <h2 className="text-3xl text-center font-bold sm:text-4xl">
                            Build a beautiful relationship with your finances.
                        </h2>
                        <p className="text-sm text-center leading-relaxed text-white/80">
                            Launch in minutes, invite your accountant, and see
                            why global teams are leaving legacy accounting
                            suites behind for a modern, automated platform.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link to="/register">
                            <Button variant="primary">Start for free</Button>
                        </Link>
                        <Button variant="outline">Talk to sales</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
