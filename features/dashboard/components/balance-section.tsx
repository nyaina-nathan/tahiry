import type { Balance } from "@/types/balance.types";
import { BalanceCard } from "@/features/dashboard/components/balance-card";

type BalanceSectionProps = {
  balance: Balance | null;
  currency: string;
  isLoading: boolean;
};

const balanceCards = [
  {
    label: "Current balance",
    detail: "Income minus expenses",
    className: "bg-[var(--color-strong)] text-white",
    mutedClassName: "text-white/70",
    valueKey: "balance",
  },
  {
    label: "Income",
    detail: "Money that moved in",
    className: "bg-[var(--color-positive)] text-white",
    mutedClassName: "text-white/70",
    valueKey: "income",
  },
  {
    label: "Expenses",
    detail: "Money that moved out",
    className: "bg-[var(--color-negative-fill)] text-white",
    mutedClassName: "text-white/70",
    valueKey: "expense",
  },
] as const;

export function BalanceSection({
  balance,
  currency,
  isLoading,
}: BalanceSectionProps) {
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
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {balanceCards.map((card) => (
          <BalanceCard
            key={card.label}
            label={card.label}
            value={balance?.[card.valueKey]}
            detail={card.detail}
            className={card.className}
            mutedClassName={card.mutedClassName}
            currency={currency}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}
