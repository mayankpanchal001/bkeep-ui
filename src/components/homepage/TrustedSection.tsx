import { TRUSTED_LOGOS } from './constants.tsx';

const TrustedSection = () => {
    return (
        <section className="relative py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header text - clean and simple */}
                <p className="text-center text-sm font-medium text-muted-foreground">
                    Trusted by thousands of bookkeepers and accountants
                </p>

                {/* Logo carousel - clean grid layout */}
                <div className="mt-10">
                    <div className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-4 md:grid-cols-8">
                        {TRUSTED_LOGOS.map((logo, index) => (
                            <div
                                key={logo}
                                className="group flex h-16 items-center justify-center animate-in fade-in"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animationDuration: '500ms',
                                    animationFillMode: 'backwards',
                                }}
                            >
                                <div className="flex h-12 w-full items-center justify-center rounded-lg border border-border/50 bg-background/50 px-4 text-center text-sm font-medium text-muted-foreground/70 backdrop-blur-sm transition-all hover:border-border hover:bg-muted/50 hover:text-foreground">
                                    {logo}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Optional: Infinite scroll marquee effect for more logos */}
                <div className="relative mt-12 overflow-hidden">
                    <div className="flex animate-marquee gap-8">
                        {[...TRUSTED_LOGOS, ...TRUSTED_LOGOS].map((logo, i) => (
                            <div
                                key={`${logo}-${i}`}
                                className="flex h-12 min-w-[140px] items-center justify-center rounded-lg border border-border/30 bg-muted/20 px-6 text-sm font-medium text-muted-foreground/60 backdrop-blur-sm"
                            >
                                {logo}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustedSection;
