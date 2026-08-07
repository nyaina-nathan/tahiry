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
    className: "bg-[var(--color-ink)] text-white",
    mutedClassName: "text-[#b7bdca]",
    valueKey: "balance",
  },
  {
    label: "Income",
    detail: "Money that moved in",
    className: "bg-[var(--color-secondary)] text-white",
    mutedClassName: "text-[#e3dafe]",
    valueKey: "income",
  },
  {
    label: "Expenses",
    detail: "Money that moved out",
    className: "bg-[var(--color-primary)] text-white",
    mutedClassName: "text-[#dbe4ff]",
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
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Lifetime view
          </p>
          <h2 id="balance-heading" className="font-display text-3xl text-[var(--color-ink)]">
            The bottom line.
          </h2>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] sm:block">
          Updated from every movement
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
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
