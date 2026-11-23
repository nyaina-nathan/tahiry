import type { AccountBalance } from "@/types/balance.types";
import Link from "next/link";
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
    <Link
      href={`/accounts/${account.id_account}`}
      aria-label={`View ${account.name} account`}
      className="balance-account group flex h-full flex-col p-3 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-(--color-muted) sm:text-[10px]">
          {account.name}
        </p>
        <span
          aria-hidden="true"
          className="-translate-x-1 text-(--color-muted) opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0"
        >
          ↗
        </span>
      </div>
      {isLoading ? (
        <div className="mt-2 h-4 w-full animate-pulse rounded-full bg-(--color-canvas) sm:mt-5 sm:h-6 sm:w-28" />
      ) : (
        <p
          className={`mt-2 break-all text-xs font-bold font-mono tabular-nums tracking-tight sm:mt-5 sm:text-xl md:text-2xl ${
            isNegative ? "text-(--color-negative)" : "text-(--color-ink)"
          }`}
        >
          {formatMoney(account.balance, currency)}
        </p>
      )}
      <p className="mt-2 hidden text-xs text-(--color-muted) sm:block">
        <span className="font-mono">
          {formatMoney(account.income, currency)}
        </span>{" "}
        in ·{" "}
        <span className="font-mono">
          {formatMoney(account.expense, currency)}
        </span>{" "}
        out
      </p>
    </Link>
  );
}
