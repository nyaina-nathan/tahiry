import type { AccountBalance } from "@/types/balance.types";
import { formatMoney } from "@/features/dashboard/utils/formatters";

type AccountBalanceCardProps = {
  account: AccountBalance;
  currency: string;
  isLoading: boolean;
};

export function AccountBalanceCard({
  account,
  currency,
  isLoading,
}: AccountBalanceCardProps) {
  const isNegative = account.balance.startsWith("-");

  return (
    <article className="border border-(--color-line) bg-(--color-surface) p-3 sm:p-5">
      <p className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-muted) sm:text-[10px]">
        {account.name}
      </p>
      {isLoading ? (
        <div className="mt-2 h-4 w-full animate-pulse bg-(--color-canvas) sm:mt-5 sm:h-6 sm:w-28" />
      ) : (
        <p
          className={`mt-2 break-all text-xs font-bold tabular-nums tracking-tight sm:mt-5 sm:text-xl md:text-2xl ${
            isNegative ? "text-(--color-negative)" : "text-(--color-ink)"
          }`}
        >
          {formatMoney(account.balance, currency)}
        </p>
      )}
      <p className="mt-2 hidden text-xs text-(--color-muted) sm:block">
        {formatMoney(account.income, currency)} in ·{" "}
        {formatMoney(account.expense, currency)} out
      </p>
    </article>
  );
}
