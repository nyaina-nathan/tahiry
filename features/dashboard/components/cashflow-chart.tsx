"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { CashflowPoint } from "@/features/dashboard/types";
import {
  formatAxisMoney,
  formatDate,
  formatMoney,
  formatWeekdayDate,
} from "@/features/dashboard/utils/formatters";

type CashflowChartProps = {
  points: CashflowPoint[];
  currency: string;
};

type CashflowTooltipProps = TooltipContentProps & {
  currency: string;
};

const INCOME_COLOR = "var(--color-accent)";
const EXPENSE_COLOR = "var(--color-negative)";

function CashflowTooltip({
  active,
  payload,
  currency,
}: CashflowTooltipProps) {
  const point = payload?.[0]?.payload as CashflowPoint | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-xl border border-(--color-line) bg-(--color-surface) px-3 py-2 shadow-[0_12px_28px_-16px_rgba(2,44,34,0.45)] backdrop-blur-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-(--color-muted)">
        {formatDate(point.date)}
      </p>
      <dl className="mt-2 space-y-1">
        <div className="flex items-center justify-between gap-6">
          <dt className="flex items-center gap-2 text-xs text-(--color-muted)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-accent)" />
            Income
          </dt>
          <dd className="text-xs font-bold font-mono text-(--color-ink)">
            {formatMoney(point.income.toFixed(2), currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt className="flex items-center gap-2 text-xs text-(--color-muted)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--color-negative)" />
            Expenses
          </dt>
          <dd className="text-xs font-bold font-mono text-(--color-ink)">
            {formatMoney(point.expense.toFixed(2), currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function CashflowChart({ points, currency }: CashflowChartProps) {
  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          accessibilityLayer
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--color-line)"
            strokeDasharray="3 4"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatWeekdayDate}
            tickLine={false}
            axisLine={{ stroke: "var(--color-line)" }}
            tick={{ fill: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            dy={8}
          />
          <YAxis
            width={64}
            tickFormatter={(value) => formatAxisMoney(Number(value), currency)}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            domain={[0, "auto"]}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-line)", strokeDasharray: "4 4" }}
            content={(props) => (
              <CashflowTooltip {...props} currency={currency} />
            )}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke={INCOME_COLOR}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: "var(--color-surface)" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expenses"
            stroke={EXPENSE_COLOR}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: "var(--color-surface)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
