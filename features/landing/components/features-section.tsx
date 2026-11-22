import Link from "next/link";
import type { ComponentType } from "react";

type FeatureArtProps = {
  className?: string;
};

type FeatureTone = "light" | "dark";

type Feature = {
  titleLines: readonly [string, string];
  description: string;
  tone: FeatureTone;
  Art: ComponentType<FeatureArtProps>;
};

const TONES = {
  light: {
    card: "border-[#053a2c]/15 bg-white text-[#053a2c]",
    description: "text-[#315e52]",
    marker: "bg-(--color-accent) text-(--color-accent-contrast)",
    art: "text-[#053a2c]/75",
    cta:
      "text-[#053a2c]/75 hover:text-[#064e3b] focus-visible:outline-[#064e3b]",
    ctaCircle: "bg-[#064e3b] text-white",
  },
  dark: {
    card: "border-white/10 bg-[#111827] text-white",
    description: "text-white/65",
    marker:
      "bg-(--color-accent) text-(--color-accent-contrast) ring-1 ring-white/15",
    art: "text-white/70",
    cta: "text-white/70 hover:text-white focus-visible:outline-white",
    ctaCircle:
      "bg-(--color-accent) text-(--color-accent-contrast) ring-1 ring-white/20",
  },
} as const;

function IncomeExpenseArt({ className }: FeatureArtProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 180 130"
      fill="none"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      >
        <rect
          x="66"
          y="18"
          width="78"
          height="96"
          rx="10"
          transform="rotate(3 105 66)"
          opacity="0.42"
        />
        <path d="M82 43h44" />
        <path d="M82 59h26" opacity="0.62" />
        <path d="M82 75h38" opacity="0.62" />
        <path d="M82 91h20" opacity="0.62" />
        <circle cx="42" cy="43" r="14" />
        <path d="M42 36v14" />
        <path d="M35 43h14" />
        <circle cx="42" cy="92" r="14" />
        <path d="M35 92h14" />
        <path d="M56 43h9" opacity="0.4" />
        <path d="M56 92h9" opacity="0.4" />
      </g>
    </svg>
  );
}

function AccountsArt({ className }: FeatureArtProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 180 130"
      fill="none"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      >
        <rect
          x="27"
          y="30"
          width="98"
          height="60"
          rx="11"
          transform="rotate(-6 76 60)"
          opacity="0.38"
        />
        <rect
          x="43"
          y="39"
          width="98"
          height="60"
          rx="11"
          transform="rotate(-2 92 69)"
          opacity="0.62"
        />
        <rect x="58" y="48" width="98" height="60" rx="11" />
        <path d="M76 66h38" opacity="0.7" />
        <path d="M76 80h22" opacity="0.4" />
        <circle
          cx="134"
          cy="62"
          r="4"
          fill="currentColor"
          stroke="none"
          opacity="0.8"
        />
        <path
          d="M28 101h126"
          strokeDasharray="3 5"
          opacity="0.22"
        />
        <path d="M40 118c0-8 6-13 14-13" opacity="0.4" />
        <path d="m50 102 4 4-5 2" opacity="0.4" />
      </g>
    </svg>
  );
}

function CashflowArt({ className }: FeatureArtProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 180 130"
      fill="none"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      >
        <path d="M30 104h122" opacity="0.3" />
        <path d="M30 104V26" opacity="0.3" />
        <path d="M30 82h122" strokeDasharray="3 6" opacity="0.18" />
        <path d="M38 86c20 0 26-26 48-22s26 16 54-14" />
        <path d="M38 96c18 0 28-8 44-10s30 12 54 4" opacity="0.55" />
        <circle cx="86" cy="64" r="4" fill="currentColor" stroke="none" />
        <circle cx="140" cy="50" r="4" fill="currentColor" stroke="none" />
        <path d="M148 30h8v8" opacity="0.3" />
      </g>
    </svg>
  );
}

function WeeklyEmailArt({ className }: FeatureArtProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 180 130"
      fill="none"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      >
        <rect
          x="62"
          y="18"
          width="64"
          height="46"
          rx="7"
          transform="rotate(3 94 41)"
          opacity="0.5"
        />
        <path d="M76 33h30" opacity="0.65" />
        <path d="M76 44h20" opacity="0.4" />
        <rect x="38" y="52" width="104" height="62" rx="10" />
        <path d="m39 61 51 33 51-33" />
        <circle cx="143" cy="32" r="13" opacity="0.65" />
        <path d="M143 25v8l5 3" opacity="0.65" />
      </g>
    </svg>
  );
}

const FEATURES: Feature[] = [
  {
    titleLines: ["Track income", "and expenses"],
    description:
      "Log what comes in and what goes out, with the account and category you choose.",
    tone: "light",
    Art: IncomeExpenseArt,
  },
  {
    titleLines: ["Multiple accounts", "one clear view"],
    description:
      "Keep cash, savings, and side money separate, with every balance in one place and transfers when you need them.",
    tone: "dark",
    Art: AccountsArt,
  },
  {
    titleLines: ["See your cashflow", "at a glance"],
    description:
      "A clear line chart shows income and spending over time, so you can see where the month is heading.",
    tone: "dark",
    Art: CashflowArt,
  },
  {
    titleLines: ["Weekly email", "reminders"],
    description:
      "Choose your day and time. A short summary of income, spending, and top categories arrives in your inbox.",
    tone: "light",
    Art: WeeklyEmailArt,
  },
];

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
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

function FeatureCard({ feature }: { feature: Feature }) {
  const tone = TONES[feature.tone];
  const { Art } = feature;

  return (
    <li className="h-full">
      <article
        className={`flex h-full min-h-[21rem] flex-col rounded-[1.6rem] border p-6 sm:min-h-[22rem] sm:rounded-[1.9rem] sm:p-8 ${tone.card}`}
      >
        <h3 className="max-w-[20rem] text-[1.35rem] font-bold leading-[1.35] tracking-[-0.035em] sm:text-[1.6rem]">
          {feature.titleLines.map((line) => (
            <span
              key={line}
              className={`box-decoration-clone mt-1.5 block w-fit max-w-full px-2 py-0.5 first:mt-0 ${tone.marker}`}
            >
              {line}
            </span>
          ))}
        </h3>

        <p
          className={`mt-4 max-w-[23rem] text-sm leading-6 ${tone.description}`}
        >
          {feature.description}
        </p>

        <div className="mt-6 flex flex-1 items-center justify-end">
          <Art className={`h-32 w-auto sm:h-36 ${tone.art}`} />
        </div>

        <Link
          href="/login"
          className={`group mt-7 inline-flex w-fit items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 ${tone.cta}`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-active:scale-[0.96] ${tone.ctaCircle}`}
          >
            <ArrowIcon />
          </span>
          Try it free
        </Link>
      </article>
    </li>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-6 bg-[#eef1f4]"
    >
      <div className="mx-auto w-full max-w-[87.5rem] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-12">
          <h2 id="features-heading" className="w-fit">
            <span className="inline-block bg-(--color-accent) px-3 py-1.5 text-xl font-bold leading-none tracking-[-0.03em] text-(--color-accent-contrast) sm:text-2xl">
              Features
            </span>
          </h2>

          <p className="max-w-[34rem] text-sm leading-6 text-[#315e52] sm:text-base sm:leading-7 md:ml-auto md:max-w-[32rem]">
            Logging a transaction takes seconds. There is nothing to link or
            integrate, so you only track what you earn and spend.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.titleLines[0]} feature={feature} />
          ))}
        </ul>
      </div>
    </section>
  );
}
