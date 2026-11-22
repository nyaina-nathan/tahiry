import { HeroSection } from "@/features/landing/components/hero-section";
import { LandingHeader } from "@/features/landing/components/landing-header";

const ASSURANCES = [
  "Free forever",
  "Set up in minutes",
  "Built for everyday money",
];

export function LandingPage() {
  return (
    <main className="landing-page min-h-screen">
      <div className="landing-hero flex min-h-svh flex-col overflow-hidden">
        <LandingHeader />
        <HeroSection />
      </div>

      <section
        aria-label="Why Tahiry"
        className="mx-auto w-full max-w-[87.5rem] px-5 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-8 lg:px-12 xl:px-16"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-[#053a2c]/10 py-5">
          {ASSURANCES.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#315e52] sm:text-[10px]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-(--color-accent)"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
