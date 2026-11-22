import Link from "next/link";
import { AccountCardShowcase } from "@/features/landing/components/account-card-showcase";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5"
    >
      <path
        d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative z-10 mx-auto grid w-full max-w-[87.5rem] grid-cols-1 items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:px-12 lg:pb-28 lg:pt-16 xl:px-16"
    >
      <div className="landing-enter max-w-[38rem]">
        <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-(--color-accent-inverse)">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-(--color-accent-inverse)"
          />
          Personal finance, in plain sight
        </p>

        <h1
          id="hero-title"
          className="mt-5 text-[clamp(2.35rem,7vw,5.25rem)] font-bold leading-[0.94] tracking-[-0.05em] text-white"
        >
          <span className="block">Every coin,</span>
          <span className="block">
            in plain sight.
          </span>
        </h1>

        <p className="mt-6 max-w-[34rem] text-base leading-7 text-white/75 sm:mt-7 sm:text-lg sm:leading-8">
          Track what comes in, what goes out, and what is left across every
          account. Tahiry keeps your everyday money clear.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-9">
          <Link
            href="/login"
            className="landing-pill group inline-flex min-h-12 items-center gap-3 rounded-full bg-(--color-accent-inverse) py-1.5 pl-5 pr-1.5 text-sm font-bold text-[#022c22] shadow-[0_14px_44px_-18px_rgba(52,211,153,0.9)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a7f3d0] sm:min-h-14 sm:pl-6 sm:pr-2 sm:text-base"
          >
            Start for free
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#022c22] text-white sm:h-10 sm:w-10">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </div>

      <AccountCardShowcase />
    </section>
  );
}
