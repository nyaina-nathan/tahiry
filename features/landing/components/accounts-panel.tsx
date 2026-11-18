import Link from "next/link";
import { Sticker } from "@/features/landing/components/sticker";

type AccountRowProps = {
  initials: string;
  name: string;
  detail: string;
  amount: string;
  tone: string;
};

function AccountRow({
  initials,
  name,
  detail,
  amount,
  tone,
}: AccountRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black bg-white p-3 text-black sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-black text-sm font-bold ${tone}`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold leading-tight">{name}</p>
          <p className="text-sm leading-tight text-[#6e6e6e]">{detail}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-sm font-bold tabular-nums">{amount}</span>
        <Link
          href="/dashboard"
          className="flex min-h-9 items-center justify-center rounded-2xl border border-black bg-white px-4 text-sm font-medium transition-colors hover:bg-black hover:text-white"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

export function AccountsPanel() {
  return (
    <section
      id="accounts"
      aria-labelledby="accounts-title"
      className="scroll-mt-28 px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-[24px] border border-black bg-[#3a3a3a] p-5 text-white sm:rounded-[46px] sm:p-10 lg:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-black bg-[#02bbff] opacity-20"
          />
          <div className="absolute right-6 top-6 z-10 hidden md:block">
            <Sticker
              tone="khaki"
              rotate={8}
              className="w-[104px] flex-col rounded-2xl px-3 py-2"
            >
              <span className="uc-display text-[1.1rem] leading-[0.9]">
                No
              </span>
              <span className="uc-display text-[1.1rem] leading-[0.9]">
                surprises.
              </span>
            </Sticker>
          </div>

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="uc-kicker text-[#adff02]">Your accounts</p>
              <h2
                id="accounts-title"
                className="uc-display mt-3 max-w-[16ch] text-[clamp(2.6rem,5.8vw,5.3125rem)]"
              >
                <span className="block">Every account.</span>
                <span className="block">One honest view.</span>
              </h2>
            </div>
            <p className="max-w-sm text-base leading-[1.4] text-[#c7c7c7]">
              Main, savings, side stash — see every balance without opening
              five apps and doing emotional math.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-3">
            <AccountRow
              initials="M"
              name="Main account"
              detail="Everyday spending"
              amount="1,240,000 MGA"
              tone="bg-[#adff02]"
            />
            <AccountRow
              initials="S"
              name="Savings"
              detail="For future you"
              amount="980,000 MGA"
              tone="bg-[#e7e3bf]"
            />
            <AccountRow
              initials="X"
              name="Side stash"
              detail="Guilt-free spending"
              amount="230,000 MGA"
              tone="bg-[#02bbff]"
            />
          </div>

          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="flex min-h-11 items-center justify-center rounded-2xl border border-black bg-[#adff02] px-6 text-sm font-bold text-black transition-colors hover:bg-white sm:w-auto"
            >
              Open the app
            </Link>
            <p className="text-sm text-[#c7c7c7]">
              Free to start. No card needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
