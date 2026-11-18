import { Sticker } from "@/features/landing/components/sticker";

const STEPS = [
  {
    title: "Add your accounts.",
    body: "Main, savings, side stash — name them however you actually think about your money.",
  },
  {
    title: "Log money in and out.",
    body: "A few seconds per expense. Add income the moment it lands. That's the whole job.",
  },
  {
    title: "Watch the pattern.",
    body: "See what's coming in, what's leaking out, and what you can actually spend.",
  },
];

export function StepsSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="steps-title"
      className="scroll-mt-28 border-y border-black bg-[#e7e3bf] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="relative">
          <p className="uc-kicker text-[#3a3a3a]">How it works</p>
          <h2
            id="steps-title"
            className="uc-display mt-3 text-[clamp(2.75rem,6.4vw,5.6rem)]"
          >
            <span className="block">Three steps.</span>
            <span className="block">Done.</span>
          </h2>
          <p className="mt-6 max-w-sm text-base leading-[1.4] text-[#3a3a3a]">
            No onboarding maze. No 47-step setup. Just enough structure to see
            your money clearly.
          </p>
          <Sticker
            tone="lime"
            rotate={-7}
            className="mt-7 rounded-2xl px-4 py-2"
          >
            <span className="uc-display text-2xl leading-none">
              That&apos;s it.
            </span>
          </Sticker>
        </div>

        <ol className="flex flex-col gap-3 sm:gap-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-4 rounded-2xl border border-black bg-white p-5 sm:p-6"
            >
              <span className="uc-display flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black bg-black text-2xl leading-none text-[#adff02]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-bold leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-base leading-[1.4] text-[#6e6e6e]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
