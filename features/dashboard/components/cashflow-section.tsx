import type { CashflowPoint } from "@/features/dashboard/types";
import { CashflowChart } from "@/features/dashboard/components/cashflow-chart";
import { formatDate, formatMoney } from "@/features/dashboard/utils/formatters";

type CashflowSectionProps = {
  points: CashflowPoint[];
  currency: string;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
};

export function CashflowSection({
  points,
  currency,
  isLoading,
  error,
  onRetry,
}: CashflowSectionProps) {
  const incomeTotal = points.reduce((total, point) => total + point.income, 0);
  const expenseTotal = points.reduce((total, point) => total + point.expense, 0);
  const hasActivity = incomeTotal > 0 || expenseTotal > 0;

  return (
    <section aria-labelledby="cashflow-heading" className="mb-12">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
            Cash flow
          </p>
          <h2
            id="cashflow-heading"
            className="font-display text-2xl text-(--color-ink) sm:text-3xl"
          >
            The last 7 days.
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-(--color-muted)">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-(--color-accent)" aria-hidden="true" />
            Income
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-(--color-negative)" aria-hidden="true" />
            Expenses
          </span>
          {points.length > 0 && (
            <span className="hidden sm:inline">
              {formatDate(points[0].date)} – {formatDate(points[points.length - 1].date)}
            </span>
          )}
        </div>
      </div>

      <div className="dash-panel p-4 sm:p-6">
        {error ? (
          <div className="flex min-h-64 flex-col items-start justify-center gap-4 sm:min-h-72">
            <p className="text-sm text-(--color-muted)">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-10 rounded-[0.65rem] bg-(--color-strong) px-4 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-(--color-accent) hover:text-(--color-accent-contrast) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-64 items-end gap-3 sm:min-h-72" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <div key={index} className="flex flex-1 flex-col gap-2">
                <div className="h-24 w-full animate-pulse rounded-lg bg-(--color-canvas) sm:h-32" />
                <div className="h-4 w-full animate-pulse rounded-full bg-(--color-canvas)" />
              </div>
            ))}
          </div>
        ) : !hasActivity ? (
          <div className="flex min-h-64 flex-col items-start justify-center gap-2 sm:min-h-72">
            <p className="text-sm font-semibold text-(--color-ink)">
              No activity in the last 7 days.
            </p>
            <p className="text-sm text-(--color-muted)">
              Log an income or an expense to see the trend here.
            </p>
          </div>
        ) : (
          <>
            <CashflowChart points={points} currency={currency} />
            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-(--color-line) pt-4 sm:max-w-md">
              <div>
                <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-(--color-muted)">
                  Income this week
                </dt>
                <dd className="mt-1 font-mono text-sm font-bold text-(--color-accent)">
                  {formatMoney(incomeTotal.toFixed(2), currency)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-(--color-muted)">
                  Expenses this week
                </dt>
                <dd className="mt-1 font-mono text-sm font-bold text-(--color-negative)">
                  {formatMoney(expenseTotal.toFixed(2), currency)}
                </dd>
              </div>
            </dl>
          </>
        )}
      </div>
    </section>
  );
}
