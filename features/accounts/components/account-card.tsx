"use client";

import { useState } from "react";
import Link from "next/link";
import type { AccountWithBalance } from "@/features/accounts/api/accounts-api";
import { formatMoney } from "@/features/dashboard/utils/formatters";

type AccountCardProps = {
  account: AccountWithBalance;
  currency: string;
};

export function AccountCard({ account, currency }: AccountCardProps) {
  const [isShown, setIsShown] = useState(false);
  const isNegative = account.balance.startsWith("-");

  return (
    <article className="dash-panel dash-card relative p-3 sm:p-5">
      <Link
        href={`/accounts/${account.id}`}
        className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
      >
        <span className="sr-only">Open {account.name}</span>
      </Link>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-muted) sm:text-[10px]">
          {account.name}
        </p>
        <button
          type="button"
          aria-pressed={isShown}
          aria-label={isShown ? "Hide account balance" : "Show account balance"}
          onClick={() => setIsShown((shown) => !shown)}
          className="relative z-10 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-(--color-muted) transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) cursor-pointer"
        >
          {isShown ? "Hide" : "Show"}
        </button>
      </div>
      {isShown ? (
        <p
          className={`mt-2 break-all text-xs font-bold tabular-nums tracking-tight sm:mt-5 sm:text-xl md:text-2xl ${
            isNegative ? "text-(--color-negative)" : "text-(--color-ink)"
          }`}
        >
          {formatMoney(account.balance, currency)}
        </p>
      ) : (
        <p
          className="mt-2 break-all text-xs font-bold tabular-nums tracking-tight text-(--color-muted) sm:mt-5 sm:text-xl md:text-2xl"
          aria-hidden="true"
        >
          {currency} ••••
        </p>
      )}
      <p className="mt-2 hidden text-xs text-(--color-muted) sm:block">
        {isShown
          ? `${formatMoney(account.income, currency)} in · ${formatMoney(account.expense, currency)} out`
          : "•••• in · •••• out"}
      </p>
    </article>
  );
}
