import type { ReactNode } from "react";

function ReceiptVisual() {
  return (
    <div className="relative flex h-[180px] w-[190px] items-center justify-center">
      <div className="absolute -left-2 top-8 h-[76px] w-[118px] -rotate-12 rounded-xl border border-black bg-[#3a3a3a] p-2">
        <div className="h-2 w-8 rounded-sm bg-[#adff02]" />
        <div className="mt-6 text-[8px] font-bold tracking-[0.18em] text-white">
          •••• 0420
        </div>
      </div>
      <div className="relative z-10 h-[164px] w-[122px] -rotate-6 border border-black bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="h-2 w-9 bg-black" />
          <span className="text-[8px] font-bold">№ 042</span>
        </div>
        <div className="mt-3 space-y-1.5">
          <span className="block h-[3px] w-full bg-black/80" />
          <span className="block h-[3px] w-4/5 bg-black/40" />
          <span className="block h-[3px] w-full bg-black/40" />
          <span className="block h-[3px] w-3/5 bg-black/40" />
        </div>
        <div className="mt-2 border-t border-dashed border-black pt-1.5">
          <div className="flex items-center justify-between text-[8px] font-bold">
            <span>TOTAL</span>
            <span>12,000</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 rotate-12 rounded-lg border border-black bg-[#adff02] px-2 py-1 text-[9px] font-bold">
          PAID
        </div>
      </div>
    </div>
  );
}

function DonutVisual() {
  return (
    <div className="relative flex h-[180px] w-[190px] items-center justify-center">
      <div
        className="absolute h-[164px] w-[164px] rotate-6 rounded-full border border-black"
        style={{
          background:
            "conic-gradient(#fa00ff 0 31%, #000 31% 50%, #adff02 50% 77%, #e7e3bf 77% 100%)",
        }}
      />
      <div className="absolute flex h-[90px] w-[90px] flex-col items-center justify-center rounded-full border border-black bg-white">
        <span className="uc-display text-[2.2rem] leading-none">68%</span>
        <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-[#6e6e6e]">
          accounted
        </span>
      </div>
      <div className="absolute -right-1 top-0 rotate-12 rounded-lg border border-black bg-white px-2 py-1 text-[9px] font-bold">
        FOOD 31%
      </div>
      <div className="absolute -left-2 bottom-2 -rotate-6 rounded-lg border border-black bg-[#fa00ff] px-2 py-1 text-[9px] font-bold">
        +18% SAVED
      </div>
    </div>
  );
}

function CalendarVisual() {
  return (
    <div className="relative flex h-[180px] w-[190px] items-center justify-center">
      <div className="relative z-10 w-[156px] rotate-3 rounded-2xl border border-black bg-white p-2">
        <div className="flex items-center justify-between rounded-lg border border-black bg-black px-2 py-1 text-[8px] font-bold text-[#adff02]">
          <span>WEEKLY</span>
          <span>09:00</span>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, index) => (
            <span
              key={index}
              className={`aspect-square rounded-[2px] border ${
                index === 10
                  ? "border-black bg-[#adff02]"
                  : index % 5 === 0
                    ? "border-black/25 bg-[#e7e3bf]"
                    : "border-black/15 bg-[#f2f2f2]"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[8px] font-bold">
          <span className="h-2 w-2 rounded-full border border-black bg-[#fa00ff]" />
          Log your week
        </div>
        <div className="absolute -right-4 -top-4 rotate-12 rounded-lg border border-black bg-[#e7e3bf] px-2 py-1 text-[9px] font-bold">
          NUDGE
        </div>
      </div>
    </div>
  );
}

type FeatureCardProps = {
  tone: string;
  index: string;
  title: ReactNode;
  caption: string;
  visual: ReactNode;
};

function FeatureCard({ tone, index, title, caption, visual }: FeatureCardProps) {
  return (
    <article
      className={`group relative flex min-h-[370px] flex-col overflow-hidden rounded-2xl border border-black p-5 sm:p-6 ${tone}`}
    >
      <div className="flex items-start justify-between">
        <span className="uc-kicker rounded-xl border border-black bg-white/75 px-2.5 py-1">
          {index}
        </span>
        <span aria-hidden="true" className="text-xl leading-none">
          ✦
        </span>
      </div>

      <div className="relative flex h-[188px] items-center justify-center">
        {visual}
      </div>

      <h3 className="uc-display mt-5 text-[clamp(2.25rem,4.8vw,3.75rem)] leading-[0.9]">
        {title}
      </h3>
      <p className="mt-4 text-base font-medium leading-[1.33] sm:text-lg">
        {caption}
      </p>
    </article>
  );
}

export function FeatureCards() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="uc-kicker text-[#3a3a3a]">What it does</p>
            <h2
              id="features-title"
              className="uc-display mt-3 text-[clamp(2.75rem,6vw,5.3125rem)]"
            >
              <span className="block">Less math.</span>
              <span className="block">More clarity.</span>
            </h2>
          </div>
          <p className="max-w-sm text-base leading-[1.4] text-[#6e6e6e]">
            Three things, done properly. Because your money deserves better
            than a notes app and a prayer.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:gap-[34px]">
          <FeatureCard
            tone="bg-[#fa00ff]"
            index="01 / Log"
            title={
              <>
                <span className="block">Log it in</span>
                <span className="block">5 seconds.</span>
              </>
            }
            caption="Add expenses and income before the receipt goes cold."
            visual={<ReceiptVisual />}
          />
          <FeatureCard
            tone="bg-[#02bbff]"
            index="02 / See"
            title={
              <>
                <span className="block">See the</span>
                <span className="block">whole picture.</span>
              </>
            }
            caption="Cashflow and balance views that make the pattern obvious."
            visual={<DonutVisual />}
          />
          <FeatureCard
            tone="bg-[#e7e3bf]"
            index="03 / Nudge"
            title={
              <>
                <span className="block">Get nudged.</span>
                <span className="block">Not judged.</span>
              </>
            }
            caption="A weekly email reminder keeps the habit alive, gently."
            visual={<CalendarVisual />}
          />
        </div>
      </div>
    </section>
  );
}
