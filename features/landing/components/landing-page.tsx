import { AccountsPanel } from "@/features/landing/components/accounts-panel";
import { CtaSection } from "@/features/landing/components/cta-section";
import { FeatureCards } from "@/features/landing/components/feature-cards";
import { HeroSection } from "@/features/landing/components/hero-section";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { StepsSection } from "@/features/landing/components/steps-section";
import { TickerStrip } from "@/features/landing/components/ticker-strip";

export function LandingPage() {
  return (
    <div className="relative overflow-x-clip">
      <a
        href="#main"
        className="sr-only z-[100] rounded-xl border border-black bg-[#adff02] px-4 py-3 text-sm font-bold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <LandingHeader />

      <main id="main">
        <HeroSection />
        <TickerStrip />
        <FeatureCards />
        <AccountsPanel />
        <StepsSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
