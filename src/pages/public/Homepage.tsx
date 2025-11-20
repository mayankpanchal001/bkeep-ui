import {
    BenefitsSection,
    CTASection,
    FeaturesSection,
    Footer,
    HeroSection,
    IndustriesSection,
    Navigation,
    StatsSection,
} from '../../components/homepage';
import '../../components/homepage/styles.css';

export default function Homepage() {
    return (
        <div className="min-h-screen w-full bg-lightBg text-primary overflow-x-hidden">
            <Navigation />
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <BenefitsSection />
            <IndustriesSection />
            <CTASection />
            <Footer />
        </div>
    );
}
