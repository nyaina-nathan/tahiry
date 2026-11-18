import Link from "next/link";
import { Sticker } from "@/features/landing/components/sticker";

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative overflow-hidden border-b border-black bg-[#fa00ff] px-5 py-20 sm:px-8 sm:py-28 lg:px-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-black bg-[#adff02] opacity-30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full border border-black bg-[#02bbff] opacity-30"
      />

      <Sticker
        tone="khaki"
        rotate={-8}
        className="absolute right-5 top-8 z-10 rounded-2xl px-3 py-2 md:right-16"
      >
        <span className="uc-display text-xl leading-none">
          No card. No catch.
        </span>
      </Sticker>

      <div className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center text-center">
        <p className="uc-kicker">Ready when you are</p>
        <h2
          id="cta-title"
          className="uc-display mt-4 text-[clamp(3.5rem,11vw,10.25rem)]"
        >
          <span className="block">Stop</span>
          <span className="block">guessing.</span>
        </h2>
        <p className="mt-6 max-w-lg text-base leading-[1.4] sm:text-lg">
          Your money is already talking. Start listening.
        </p>
        <Link
          href="/login"
          className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-black bg-[#adff02] px-6 text-sm font-bold transition-colors hover:bg-black hover:text-[#adff02] sm:w-auto"
        >
          Start tracking free
          <span aria-hidden="true">→</span>
        </Link>
        <p className="uc-hand mt-5 text-2xl sm:text-3xl">
          future you says thanks.
        </p>
      </div>
    </section>
  );
}
