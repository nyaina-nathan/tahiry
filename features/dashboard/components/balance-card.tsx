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
    <article
      className={`min-h-0 p-3 sm:min-h-40 sm:p-5 md:p-6 ${className}`}
    >
      <div aria-hidden="true" className="balance-hero-glow" />
      <div className="relative">
        <p
          className={`text-[9px] font-bold text-center uppercase tracking-[0.16em] sm:text-[10px] ${mutedClassName}`}
        >
          {label}
        </p>
        {isLoading ? (
          <div className="mt-2 h-4 w-full animate-pulse rounded-full bg-white/20 sm:mt-5 sm:h-9 sm:w-40" />
        ) : (
          <p className="mt-2 break-all text-[15px] font-bold font-mono tabular-nums tracking-tight sm:mt-5 sm:text-3xl md:text-4xl text-center">
            {formatMoney(value ?? "0.00", currency)}
          </p>
        )}
      </div>
    </article>
  );
}
