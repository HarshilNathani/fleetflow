import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { IntelligenceSection } from '@/components/landing/IntelligenceSection';
import { MotionSection } from '@/components/landing/MotionSection';
import { ValueSection } from '@/components/landing/ValueSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { AmbientBackground } from '@/components/landing/AmbientBackground';
import { CinematicDivider } from '@/components/landing/CinematicDivider';

export default function Home() {
    return (
        <main className="relative bg-slate-950 min-h-screen">
            <AmbientBackground />
            <div className="relative z-10">
                <LandingNav />
                <HeroSection />
                <ProblemSection />
                <CinematicDivider />
                <IntelligenceSection />
                <MotionSection />
                <ValueSection />
                <CTASection />
                <Footer />
            </div>
        </main>
    );
}
