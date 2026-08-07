import { formatMoney } from "@/features/dashboard/utils/formatters";

type BalanceCardProps = {
  label: string;
  value: string | undefined;
  detail: string;
  className: string;
  mutedClassName: string;
  currency: string;
  isLoading: boolean;
};

export function BalanceCard({
  label,
  value,
  detail,
  className,
  mutedClassName,
  currency,
  isLoading,
}: BalanceCardProps) {
  return (
    <article className={`min-h-40 p-5 sm:p-6 ${className}`}>
      <p
        className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${mutedClassName}`}
      >
        {label}
      </p>
      {isLoading ? (
        <div className="mt-5 h-9 w-40 animate-pulse bg-white/20" />
      ) : (
        <p className="mt-5 break-all text-3xl font-bold tracking-tight sm:text-4xl">
          {formatMoney(value ?? "0.00", currency)}
        </p>
      )}
      <p className={`mt-3 text-sm ${mutedClassName}`}>{detail}</p>
    </article>
  );
}
