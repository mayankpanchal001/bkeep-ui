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
import RevealOnScroll from '@/components/homepage/RevealOnScroll';
import '@/components/homepage/styles.css';

export default function Homepage() {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-20 bg-background" />
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-60" />
            <div className="bg-noise" />
            {/* test */}
            <Navigation />
            <main className="relative flex flex-col gap-0">
                <HeroSection />

                <RevealOnScroll delay={0.2}>
                    <TrustedSection />
                </RevealOnScroll>

                <RevealOnScroll>
                    <StatsSection />
                </RevealOnScroll>

                <div className="relative">
                    <div className="absolute inset-0 -z-10 bg-linear-to-b from-transparent via-muted/30 to-transparent blur-3xl" />
                    <RevealOnScroll>
                        <FeaturesSection />
                    </RevealOnScroll>
                </div>

                <RevealOnScroll>
                    <BenefitsSection />
                </RevealOnScroll>

                <RevealOnScroll>
                    <IndustriesSection />
                </RevealOnScroll>

                <div className="relative overflow-hidden">
                    <div className="absolute -left-1/4 top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
                    <RevealOnScroll>
                        <PricingSection />
                    </RevealOnScroll>
                </div>

                <RevealOnScroll>
                    <TestimonialsSection />
                </RevealOnScroll>

                <RevealOnScroll>
                    <FAQSection />
                </RevealOnScroll>

                <RevealOnScroll delay={0.1}>
                    <CTASection />
                </RevealOnScroll>
            </main>
            <Footer />
        </div>
    );
}
