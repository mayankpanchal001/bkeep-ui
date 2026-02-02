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
import {
    GSAPScrollAnimation,
    GSAPParallaxSection,
    GSAPPageLoad,
    GSAPScrollProgress,
    GSAPCursorFollower,
} from '@/components/homepage/GSAPAnimations';
import '@/components/homepage/styles.css';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Homepage() {
    const backgroundRef = useRef<HTMLDivElement>(null);

    // Advanced background animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate background gradients on scroll
            gsap.to('.gradient-orb-1', {
                y: 200,
                x: -100,
                scale: 1.2,
                opacity: 0.8,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1,
                },
            });

            gsap.to('.gradient-orb-2', {
                y: -150,
                x: 100,
                scale: 0.9,
                opacity: 0.6,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.5,
                },
            });

            gsap.to('.gradient-orb-3', {
                y: 100,
                x: -50,
                scale: 1.1,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 2,
                },
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <GSAPPageLoad>
            <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
                {/* Scroll Progress Indicator */}
                <GSAPScrollProgress />

                {/* Custom Cursor Follower */}
                <GSAPCursorFollower />

                {/* Clean minimal background with animated gradients */}
                <div
                    ref={backgroundRef}
                    className="fixed inset-0 -z-20 bg-background"
                />

                {/* Animated gradient orbs with parallax */}
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div
                        className="gradient-orb-1 absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]"
                        style={{ willChange: 'transform' }}
                    />
                    <div
                        className="gradient-orb-2 absolute -right-1/4 top-1/2 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[140px]"
                        style={{ willChange: 'transform' }}
                    />
                    <div
                        className="gradient-orb-3 absolute bottom-1/4 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-primary/6 blur-[100px]"
                        style={{ willChange: 'transform' }}
                    />
                </div>

                {/* Subtle gradient overlay */}
                <div className="fixed inset-0 -z-10 bg-linear-to-b from-background via-background to-muted/20 opacity-40" />

                {/* Navigation - with fade in animation */}
                <GSAPScrollAnimation
                    animation="fadeDown"
                    duration={0.8}
                    delay={0.3}
                >
                    <Navigation />
                </GSAPScrollAnimation>

                {/* Main Content - Clean sections with advanced animations */}
                <main className="relative flex flex-col">
                    {/* Hero Section - Parallax effect with staggered content */}
                    <GSAPParallaxSection speed={0.3}>
                        <section className="relative overflow-hidden bg-background">
                            <GSAPScrollAnimation
                                animation="scale"
                                duration={1.2}
                                delay={0.5}
                                ease="power4.out"
                            >
                                <HeroSection />
                            </GSAPScrollAnimation>
                        </section>
                    </GSAPParallaxSection>

                    {/* Trusted Section - Slide in with reveal */}
                    <GSAPScrollAnimation
                        animation="reveal"
                        duration={1.5}
                        ease="power3.inOut"
                        start="top 90%"
                    >
                        <section className="relative border-y border-border/50 bg-background">
                            <TrustedSection />
                        </section>
                    </GSAPScrollAnimation>

                    {/* Stats Section - Staggered fade up with counter animations */}
                    <GSAPScrollAnimation
                        animation="stagger"
                        duration={1}
                        stagger={0.15}
                        start="top 75%"
                    >
                        <section className="relative bg-background py-16 md:py-24">
                            <StatsSection />
                        </section>
                    </GSAPScrollAnimation>

                    {/* Features Section - Wave animation with parallax */}
                    <GSAPScrollAnimation
                        animation="wave"
                        duration={1.2}
                        stagger={0.2}
                        ease="elastic.out(1, 0.5)"
                        start="top 70%"
                    >
                        <section className="relative bg-muted/30 py-16 md:py-24">
                            <GSAPParallaxSection speed={0.15}>
                                <FeaturesSection />
                            </GSAPParallaxSection>
                        </section>
                    </GSAPScrollAnimation>

                    {/* Benefits Section - Alternating slide animations */}
                    <GSAPScrollAnimation
                        animation="fadeLeft"
                        duration={1.2}
                        ease="power3.out"
                        start="top 75%"
                    >
                        <section className="relative bg-background py-16 md:py-24">
                            <BenefitsSection />
                        </section>
                    </GSAPScrollAnimation>

                    {/* Industries Section - Blur reveal effect */}
                    <GSAPScrollAnimation
                        animation="blur"
                        duration={1.4}
                        ease="power2.out"
                        start="top 70%"
                    >
                        <section className="relative bg-muted/30 py-16 md:py-24">
                            <IndustriesSection />
                        </section>
                    </GSAPScrollAnimation>

                    {/* Pricing Section - Scale in with magnetic hover */}
                    <GSAPScrollAnimation
                        animation="scale"
                        duration={1.3}
                        ease="back.out(1.4)"
                        start="top 75%"
                    >
                        <section className="relative bg-background py-16 md:py-24">
                            <PricingSection />
                        </section>
                    </GSAPScrollAnimation>

                    {/* Testimonials Section - Fade up with stagger */}
                    <GSAPScrollAnimation
                        animation="stagger"
                        duration={1}
                        stagger={0.2}
                        start="top 75%"
                    >
                        <section className="relative border-y border-border/50 bg-muted/20 py-16 md:py-24">
                            <TestimonialsSection />
                        </section>
                    </GSAPScrollAnimation>

                    {/* FAQ Section - Accordion reveal with rotation */}
                    <GSAPScrollAnimation
                        animation="rotate"
                        duration={1.2}
                        ease="power3.out"
                        start="top 75%"
                    >
                        <section className="relative bg-background py-16 md:py-24">
                            <FAQSection />
                        </section>
                    </GSAPScrollAnimation>

                    {/* CTA Section - Final dramatic entrance */}
                    <GSAPScrollAnimation
                        animation="fadeUp"
                        duration={1.5}
                        delay={0.2}
                        ease="power4.out"
                        start="top 80%"
                    >
                        <section className="relative overflow-hidden bg-linear-to-b from-background to-muted/30 py-20 md:py-32">
                            <GSAPParallaxSection speed={0.2}>
                                {/* Animated background elements */}
                                <div className="absolute inset-0 -z-10">
                                    <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] animate-pulse rounded-full bg-primary/10 blur-[100px]" />
                                    <div className="absolute right-1/4 bottom-1/4 h-[350px] w-[350px] animate-pulse rounded-full bg-primary/8 blur-[120px] delay-500" />
                                </div>
                                <CTASection />
                            </GSAPParallaxSection>
                        </section>
                    </GSAPScrollAnimation>
                </main>

                {/* Footer - Slide up reveal */}
                <GSAPScrollAnimation
                    animation="fadeUp"
                    duration={1}
                    start="top 90%"
                >
                    <footer className="relative border-t border-border/50 bg-background">
                        <Footer />
                    </footer>
                </GSAPScrollAnimation>
            </div>
        </GSAPPageLoad>
    );
}
