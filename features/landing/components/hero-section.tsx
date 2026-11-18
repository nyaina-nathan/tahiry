import Link from "next/link";
import { PhoneMockup } from "@/features/landing/components/phone-mockup";
import { Sticker } from "@/features/landing/components/sticker";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden px-5 pb-24 pt-36 sm:px-8 sm:pb-32 sm:pt-40 lg:px-[168px] lg:pb-36 lg:pt-44"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <p className="uc-kicker rounded-2xl border border-black bg-white px-3 py-1.5 text-[#3a3a3a]">
          Personal finance, but make it obvious
        </p>

        <h1
          id="hero-title"
          className="uc-display mt-6 text-[clamp(3.5rem,13.5vw,10.25rem)]"
        >
          <span className="block">Money,</span>
          <span className="block">minus</span>
          <span className="block">the mess.</span>
        </h1>

        <p className="mt-8 max-w-[34rem] text-base leading-[1.4] text-[#3a3a3a] sm:text-lg">
          Tahiry is the loud, simple money tracker that shows you where every
          coin went. No spreadsheets, no shame, no surprises.
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/login"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-black bg-[#adff02] px-6 text-sm font-bold transition-colors hover:bg-black hover:text-[#adff02] sm:w-auto"
          >
            Start tracking free
          </Link>
          <a
            href="#how-it-works"
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-black bg-white px-6 text-sm font-medium transition-colors hover:bg-[#e7e3bf] sm:w-auto"
          >
            See how it works
          </a>
        </div>

        <p className="uc-hand mt-5 inline-block -rotate-3 text-2xl text-[#3a3a3a] sm:text-3xl">
          future you says thanks.
        </p>
      </div>

      <div className="relative mx-auto mt-16 flex max-w-[980px] justify-center sm:mt-20">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-[#e7e3bf] sm:h-[540px] sm:w-[540px]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-[#f2f2f2] sm:h-[430px] sm:w-[430px]"
        />

        <div className="absolute left-0 top-6 z-20 hidden sm:left-10 sm:top-12 sm:block">
          <Sticker
            tone="pink"
            rotate={-8}
            className="w-[138px] flex-col rounded-2xl px-3 py-2"
          >
            <span className="uc-display text-[1.6rem] leading-[0.9]">
              Budget?
            </span>
            <span className="uc-display text-[1.6rem] leading-[0.9]">
              Handled.
            </span>
          </Sticker>
        </div>

        <div className="absolute right-0 top-28 z-20 hidden sm:right-10 sm:block">
          <Sticker
            tone="cyan"
            rotate={8}
            className="w-[120px] flex-col rounded-2xl px-3 py-2"
          >
            <span className="uc-kicker text-[0.6rem]">Saved this month</span>
            <span className="uc-display text-[2.4rem] leading-none">
              +18%
            </span>
          </Sticker>
        </div>

        <div className="absolute bottom-24 left-1 z-20 hidden sm:left-8 sm:bottom-20 sm:block">
          <Sticker
            tone="lime"
            rotate={-4}
            className="w-[136px] flex-col rounded-2xl px-3 py-2"
          >
            <span className="uc-display text-[1.15rem] leading-[0.9]">
              No more
            </span>
            <span className="uc-display text-[1.15rem] leading-[0.9]">
              spreadsheets.
            </span>
          </Sticker>
        </div>

        <div className="absolute bottom-16 right-2 z-20 hidden sm:bottom-14 sm:right-0 sm:block">
          <Sticker
            tone="white"
            rotate={-7}
            className="w-[112px] flex-col rounded-2xl px-3 py-2"
          >
            <span className="uc-display text-[1.1rem] leading-[0.9]">
              Receipt
            </span>
            <span className="uc-display text-[1.1rem] leading-[0.9]">
              caught.
            </span>
          </Sticker>
        </div>

        <div className="relative z-10">
          <PhoneMockup />
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-6 flex max-w-[980px] flex-wrap items-center justify-center gap-2 sm:hidden">
        <Sticker
          tone="pink"
          rotate={-6}
          className="rounded-xl px-3 py-1.5"
        >
          <span className="uc-display text-[1.05rem] leading-none">
            Budget? Handled.
          </span>
        </Sticker>
        <Sticker tone="cyan" rotate={5} className="rounded-xl px-3 py-1.5">
          <span className="uc-display text-[1.05rem] leading-none">
            +18% saved
          </span>
        </Sticker>
        <Sticker tone="lime" rotate={-3} className="rounded-xl px-3 py-1.5">
          <span className="uc-display text-[1.05rem] leading-none">
            No spreadsheets
          </span>
        </Sticker>
      </div>
    </section>
  );
}
