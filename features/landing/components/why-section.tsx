const GITHUB_URL = "https://github.com/nyaina-nathan/tahiry";
const CONTACT_EMAIL = "nyaina.nathan.2@gmail.com";

const PILL =
  "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full px-5 text-sm font-bold transition-[color,background-color,border-color,transform] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:active:scale-[0.97] sm:min-h-12 sm:px-6";

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.53.73.53 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4"
    >
      <rect
        x="1.75"
        y="3.25"
        width="12.5"
        height="9.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="m2.5 4.5 5.5 4 5.5-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function WhyArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 240 200"
      fill="none"
      className={className}
    >
      <g
        stroke="#111827"
        strokeWidth="1"
        opacity="0.2"
        transform="rotate(-8 128 104)"
      >
        <ellipse cx="128" cy="108" rx="100" ry="29" />
        <ellipse cx="128" cy="103" rx="77" ry="22" />
        <ellipse cx="128" cy="98" rx="54" ry="16" />
      </g>

      <circle cx="132" cy="72" r="28" fill="#111827" />
      <ellipse cx="123.5" cy="68" rx="3.8" ry="6.6" fill="#ffffff" />
      <ellipse cx="140.5" cy="68" rx="3.8" ry="6.6" fill="#ffffff" />

      <path
        d="M80 132c2.8 14 7 18.2 21 21-14 2.8-18.2 7-21 21-2.8-14-7-18.2-21-21 14-2.8 18.2-7 21-21Z"
        fill="var(--color-accent)"
      />
      <path
        d="M186 112c2.2 11 5.5 14.3 16.5 16.5-11 2.2-14.3 5.5-16.5 16.5-2.2-11-5.5-14.3-16.5-16.5 11-2.2 14.3-5.5 16.5-16.5Z"
        fill="#111827"
        opacity="0.12"
      />
    </svg>
  );
}

export function WhySection() {
  return (
    <section
      id="about"
      aria-labelledby="why-heading"
      className="scroll-mt-6 bg-[#eef1f4]"
    >
      <div className="mx-auto w-full max-w-[87.5rem] px-5 pt-2 pb-16 sm:px-8 sm:pt-4 sm:pb-20 lg:px-12 lg:pb-24 xl:px-16">
        <div className="rounded-[1.6rem] border border-[#053a2c]/10 bg-[#e6e9ed] p-6 sm:rounded-[2rem] sm:p-9 lg:p-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="max-w-[38rem]">
              <h2
                id="why-heading"
                className="text-[1.6rem] font-bold leading-[1.15] tracking-[-0.04em] text-[#053a2c] sm:text-[2rem] lg:text-[2.35rem]"
              >
                Why use Tahiry
              </h2>

              <p className="mt-4 text-sm leading-6 text-[#315e52] sm:text-base sm:leading-7">
                We built Tahiry to be easy from the first minute: log what comes
                in, log what goes out, and the app keeps the rest clear. It
                covers what everyday money needs, with nothing extra to learn.
              </p>

              <p className="mt-3 text-sm leading-6 text-[#315e52] sm:text-base sm:leading-7">
                Tahiry is open source.{" "}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-bold text-[#053a2c] underline decoration-[#053a2c]/35 underline-offset-4 transition-colors duration-150 hover:decoration-[#053a2c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064e3b]"
                >
                  Read the code on GitHub
                </a>{" "}
                and if something is missing, tell us. Feature requests are
                always welcome.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${PILL} bg-[#111827] text-white hover:bg-[#1f2937] focus-visible:outline-[#111827]`}
                >
                  <GitHubIcon />
                  View on GitHub
                </a>

                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className={`${PILL} border border-(--color-accent) bg-transparent text-(--color-accent) hover:bg-white focus-visible:outline-(--color-accent)`}
                >
                  <MailIcon />
                  Get in touch
                </a>
              </div>
            </div>

            <WhyArt className="hidden h-auto w-48 shrink-0 sm:block lg:w-72" />
          </div>
        </div>
      </div>
    </section>
  );
}
