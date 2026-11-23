import type { MovementType } from "@/types/money-movement.types";
import type {
  DailyTotalPoint,
  DateRange,
} from "@/features/dashboard/utils/date-range";
import { MovementBarChart } from "@/features/movements/components/movement-bar-chart";
import { formatDate, formatMoney } from "@/features/dashboard/utils/formatters";

type MovementChartSectionProps = {
  points: DailyTotalPoint[];
  currency: string;
  movementType: Exclude<MovementType, "TRANSFERT">;
  range: DateRange | null;
  selectedDay: string | null;
  isLoading: boolean;
  error: string;
  onSelectDay: (day: string) => void;
  onRetry: () => void;
};

export function MovementChartSection({
  points,
  currency,
  movementType,
  range,
  selectedDay,
  isLoading,
  error,
  onSelectDay,
  onRetry,
}: MovementChartSectionProps) {
  const isExpense = movementType === "EXPENSE";
  const total = points.reduce((sum, point) => sum + point.total, 0);
  const hasActivity = total > 0;
  const totalClassName = isExpense
    ? "text-(--color-negative)"
    : "text-(--color-accent)";

  return (
    <section aria-labelledby="movement-chart-heading" className="mb-12">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
            {isExpense ? "Spending trend" : "Income trend"}
          </p>
          <h2
            id="movement-chart-heading"
            className="font-semibold text-2xl text-(--color-ink) sm:text-3xl"
          >
            {isExpense ? "Daily expenses." : "Daily income."}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.14em] text-(--color-muted)">
          {range && (
            <span>
              {formatDate(range.from)} – {formatDate(range.to)}
            </span>
          )}
          {hasActivity && (
            <span>
              <span className="font-mono">{points.length}</span> days
            </span>
          )}
        </div>
      </div>

      <div className="dash-panel p-4 sm:p-6">
        {error ? (
          <div className="flex min-h-64 flex-col items-start justify-center gap-4 sm:min-h-72">
            <p className="text-sm text-(--color-muted)">{error}</p>
            {range && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-10 rounded-[0.65rem] bg-(--color-strong) px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-(--color-accent) hover:text-(--color-accent-contrast) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
              >
                Try again
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div
            className="flex min-h-64 items-end gap-3 sm:min-h-72"
            aria-hidden="true"
          >
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
              No {isExpense ? "expenses" : "income"} in this range.
            </p>
            <p className="text-sm text-(--color-muted)">
              Log {isExpense ? "an expense" : "income"} or pick another date
              range to see the trend here.
            </p>
          </div>
        ) : (
          <>
            <MovementBarChart
              points={points}
              currency={currency}
              movementType={movementType}
              selectedDay={selectedDay}
              onSelectDay={onSelectDay}
            />
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-(--color-line) pt-4">
              <dl>
                <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-(--color-muted)">
                  Total {isExpense ? "expenses" : "income"}
                </dt>
                <dd
                  className={`mt-1 text-sm font-bold font-mono ${totalClassName}`}
                >
                  {formatMoney(total.toFixed(2), currency)}
                </dd>
              </dl>
              <p className="text-[10px] uppercase tracking-[0.12em] text-(--color-muted)">
                {selectedDay
                  ? `List filtered to ${formatDate(selectedDay)}.`
                  : "Click a bar to filter the list by day."}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
