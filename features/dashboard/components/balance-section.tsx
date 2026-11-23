"use client";

import type { Balance } from "@/types/balance.types";
import { AccountBalanceCard } from "@/features/dashboard/components/account-balance-card";
import { BalanceCard } from "@/features/dashboard/components/balance-card";

type BalanceSectionProps = {
  balance: Balance | null;
  currency: string;
  isLoading: boolean;
};

const ACCOUNT_SKELETON_COUNT = 3;

export function BalanceSection({
  balance,
  currency,
  isLoading,
}: BalanceSectionProps) {
  const accounts = balance?.accounts ?? [];

  return (
    <section aria-labelledby="balance-heading" className="relative isolate mb-12">
      <div aria-hidden="true" className="balance-aura" />

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-(--color-line) bg-(--color-surface)/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent) backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-(--color-accent)"
            />
            Lifetime view
          </p>
          <h2 id="balance-heading" className="font-semibold text-2xl text-(--color-ink) sm:text-3xl">
            The bottom line.
          </h2>
        </div>
        <span className="hidden text-[10px] uppercase tracking-[0.14em] text-(--color-muted) sm:block">
          Updated from every movement
        </span>
      </div>

      <BalanceCard
        label="Current balance"
        value={balance?.balance}
        detail="Income minus expenses across all accounts"
        className="balance-hero balance-rise text-white"
        mutedClassName="text-white/70"
        currency={currency}
        isLoading={isLoading}
      />

      {!isLoading && accounts.length === 0 ? (
        <div className="balance-rise mt-2 rounded-[1rem] border border-white/75 bg-white/60 p-4 backdrop-blur-sm sm:mt-4 sm:rounded-[var(--radius-card)] sm:p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-muted) sm:text-[10px]">
            No accounts yet.
          </p>
          <p className="mt-2 text-xs text-(--color-muted) sm:mt-4 sm:text-sm">
            Account balances will show up here.
          </p>
        </div>
      ) : (
        <div className="balance-account-grid mt-2 sm:mt-4">
          {isLoading && accounts.length === 0
            ? Array.from({ length: ACCOUNT_SKELETON_COUNT }, (_, index) => (
                <article
                  key={index}
                  className="rounded-[1rem] border border-white/75 bg-white/60 p-3 backdrop-blur-sm sm:rounded-[var(--radius-card)] sm:p-5 dark:border-white/10 dark:bg-white/5"
                  aria-hidden="true"
                >
                  <div className="h-2.5 w-20 animate-pulse rounded-full bg-(--color-canvas)" />
                  <div className="mt-2 h-4 w-full animate-pulse rounded-full bg-(--color-canvas) sm:mt-5 sm:h-6 sm:w-28" />
                </article>
              ))
            : accounts.map((account, index) => (
                <div
                  key={account.id_account}
                  className="balance-rise"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <AccountBalanceCard
                    account={account}
                    currency={currency}
                    isLoading={isLoading}
                  />
                </div>
              ))}
        </div>
      )}
    </section>
  );
}
