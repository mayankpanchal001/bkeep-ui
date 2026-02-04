import {
    BenefitsSection,
    CTASection,
    FAQSection,
    FeaturesSection,
    Footer,
    HeroSection,
    IndustriesSection,
    Navigation,
    PricingSection,
    StatsSection,
    TestimonialsSection,
    TrustedSection,
} from '@/components/homepage';
import '@/components/homepage/styles.css';

export default function Homepage() {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
            {/* Background */}
            <div className="fixed inset-0 -z-20 bg-background" />

            {/* Static gradient orbs */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -right-1/4 top-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />
                <div className="absolute bottom-1/4 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
            </div>

            {/* Subtle gradient overlay */}
            <div className="fixed inset-0 -z-10 bg-linear-to-b from-background via-background to-muted/20 opacity-40" />

            <Navigation />

            <main className="relative flex flex-col">
                <section className="relative overflow-hidden bg-background">
                    <HeroSection />
                </section>

                <section className="relative border-y border-border/50 bg-background">
                    <TrustedSection />
                </section>

                <section className="relative bg-background py-16 md:py-24">
                    <StatsSection />
                </section>

                <section className="relative bg-muted/30 py-16 md:py-24">
                    <FeaturesSection />
                </section>

                <section className="relative bg-background py-16 md:py-24">
                    <BenefitsSection />
                </section>

                <section className="relative bg-muted/30 py-16 md:py-24">
                    <IndustriesSection />
                </section>

                <section className="relative bg-background py-16 md:py-24">
                    <PricingSection />
                </section>

                <section className="relative border-y border-border/50 bg-muted/20 py-16 md:py-24">
                    <TestimonialsSection />
                </section>

                <section className="relative bg-background py-16 md:py-24">
                    <FAQSection />
                </section>

                <section className="relative overflow-hidden bg-linear-to-b from-background to-muted/30 py-20 md:py-32">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-primary/10 blur-[100px]" />
                        <div className="absolute right-1/4 bottom-1/4 h-[350px] w-[350px] animate-pulse rounded-full bg-primary/10 blur-[120px] delay-500" />
                    </div>
                    <CTASection />
                </section>
            </main>

            <footer className="relative border-t border-border/50 bg-background">
                <Footer />
            </footer>
        </div>
    );
}
