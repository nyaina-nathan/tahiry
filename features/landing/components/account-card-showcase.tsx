"use client";

import Image from "next/image";
import { useState } from "react";
import { formatMoney } from "@/features/dashboard/utils/formatters";
import {
  PREVIEW_ACCOUNTS,
  PREVIEW_CURRENCY,
  type PreviewAccount,
} from "@/features/landing/data/preview-accounts";

type AccountOptionProps = {
  account: PreviewAccount;
  onSelect: () => void;
};

function AccountOption({ account, onSelect }: AccountOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Preview ${account.name}`}
      aria-controls="preview-account-card"
      className="landing-option-card group relative flex w-full flex-row items-center justify-between gap-3 rounded-[1.1rem] border border-white/80 bg-white/90 p-3 text-left text-[#053a2c] shadow-[0_18px_40px_-24px_rgba(2,44,34,0.7)] backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a7f3d0] sm:min-w-0 sm:flex-1 sm:flex-col sm:items-stretch sm:justify-start sm:rounded-[1.3rem] sm:p-4"
    >
      <span className="flex min-w-0 items-center gap-2 sm:justify-between">
        <span className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#053a2c]/60">
          {account.name}
        </span>
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#064e3b]"
        />
      </span>
      <span className="shrink-0 text-[10px] font-bold leading-tight tabular-nums tracking-tight sm:mt-3 sm:text-sm">
        {formatMoney(account.balance, PREVIEW_CURRENCY)}
      </span>
      <span className="mt-1 hidden text-[9px] leading-4 text-[#053a2c]/55 sm:block">
        {formatMoney(account.income, PREVIEW_CURRENCY)} in ·{" "}
        {formatMoney(account.expense, PREVIEW_CURRENCY)} out
      </span>
    </button>
  );
}

export function AccountCardShowcase() {
  const [activeId, setActiveId] = useState(PREVIEW_ACCOUNTS[0].id);

  const activeAccount =
    PREVIEW_ACCOUNTS.find((account) => account.id === activeId) ??
    PREVIEW_ACCOUNTS[0];

  const options = PREVIEW_ACCOUNTS.filter(
    (account) => account.id !== activeAccount.id,
  );

  return (
    <div className="landing-enter landing-enter-delay relative mx-auto w-full max-w-[34rem] lg:mr-0 lg:max-w-[32rem]">
      <div aria-hidden="true" className="landing-card-halo" />

      <div className="relative z-10">
        <article
          id="preview-account-card"
          aria-live="polite"
          aria-atomic="true"
          className="landing-account-card relative overflow-hidden rounded-[1.6rem] border border-white/80 p-5 text-[#053a2c] sm:rounded-[2rem] sm:p-7"
        >
          <div aria-hidden="true" className="landing-card-ring" />
          <div aria-hidden="true" className="landing-card-glow" />

          <div key={activeAccount.id} className="landing-card-content relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#053a2c]/55">
                  {activeAccount.label}
                </p>
                <h2 className="mt-1 truncate text-lg font-bold tracking-tight sm:text-xl">
                  {activeAccount.name}
                </h2>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.8rem] border border-[#053a2c]/10 bg-white/55 p-1">
                <Image
                  src="/icon.png"
                  alt=""
                  width={32}
                  height={32}
                  loading="eager"
                  className="h-full w-full object-contain"
                />
              </span>
            </div>

            <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#053a2c]/50 sm:mt-9">
              Current balance
            </p>
            <p className="mt-1.5 break-words text-[clamp(1.4rem,5.2vw,2.75rem)] font-bold leading-none tabular-nums tracking-[-0.05em]">
              {formatMoney(activeAccount.balance, PREVIEW_CURRENCY)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#053a2c]/15 pt-4 sm:mt-7">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#053a2c]/50">
                  Money in
                </p>
                <p className="mt-1 text-xs font-bold tabular-nums text-[#065f46] sm:text-sm">
                  {formatMoney(activeAccount.income, PREVIEW_CURRENCY)}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#053a2c]/50">
                  Money out
                </p>
                <p className="mt-1 text-xs font-bold tabular-nums text-[#b91c1c] sm:text-sm">
                  {formatMoney(activeAccount.expense, PREVIEW_CURRENCY)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#053a2c]/15 pt-4">
              <p className="font-mono text-[11px] font-bold tracking-[0.22em] text-[#053a2c]/60">
                •••• {activeAccount.digits}
              </p>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#053a2c]/45">
                Tahiry
              </p>
            </div>
          </div>
        </article>

        <div className="mt-6 sm:mt-7">
          <p className="inline-flex items-center rounded-full bg-[#022c22]/35 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#d1fae5]/80 backdrop-blur-sm">
            Switch account
          </p>
          <div
            role="group"
            aria-label="Preview another account"
            className="mt-3 grid grid-cols-1 gap-2 px-1 pb-5 pt-1 sm:flex sm:gap-3 sm:overflow-visible sm:pb-6"
          >
            {options.map((account) => (
              <AccountOption
                key={account.id}
                account={account}
                onSelect={() => setActiveId(account.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
