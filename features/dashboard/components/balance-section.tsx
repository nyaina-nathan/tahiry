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
    <section aria-labelledby="balance-heading" className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
            Lifetime view
          </p>
          <h2 id="balance-heading" className="font-display text-2xl text-(--color-ink) sm:text-3xl">
            The bottom line.
          </h2>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-(--color-muted) sm:block">
          Updated from every movement
        </span>
      </div>

      <BalanceCard
        label="Current balance"
        value={balance?.balance}
        detail="Income minus expenses across all accounts"
        className="bg-[var(--color-strong)] text-white"
        mutedClassName="text-white/70"
        currency={currency}
        isLoading={isLoading}
      />

      {!isLoading && accounts.length === 0 ? (
        <div className="mt-2 border border-(--color-line) bg-(--color-surface) p-3 sm:mt-4 sm:p-5">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-muted) sm:text-[10px]">
            No accounts yet.
          </p>
          <p className="mt-2 text-xs text-(--color-muted) sm:mt-4 sm:text-sm">
            Account balances will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {isLoading && accounts.length === 0
            ? Array.from({ length: ACCOUNT_SKELETON_COUNT }, (_, index) => (
                <article
                  key={index}
                  className="border border-(--color-line) bg-(--color-surface) p-3 sm:p-5"
                  aria-hidden="true"
                >
                  <div className="h-2.5 w-20 animate-pulse bg-(--color-canvas)" />
                  <div className="mt-2 h-4 w-full animate-pulse bg-(--color-canvas) sm:mt-5 sm:h-6 sm:w-28" />
                </article>
              ))
            : accounts.map((account) => (
                <AccountBalanceCard
                  key={account.id_account}
                  account={account}
                  currency={currency}
                  isLoading={isLoading}
                />
              ))}
        </div>
      )}
    </section>
  );
}
