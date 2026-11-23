"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { MovementType } from "@/types/money-movement.types";
import type { DailyTotalPoint } from "@/features/dashboard/utils/date-range";
import {
  formatAxisMoney,
  formatDate,
  formatMoney,
  formatWeekdayDate,
} from "@/features/dashboard/utils/formatters";

type MovementBarChartProps = {
  points: DailyTotalPoint[];
  currency: string;
  movementType: Exclude<MovementType, "TRANSFERT">;
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
};

type MovementTooltipProps = TooltipContentProps & {
  currency: string;
  movementType: Exclude<MovementType, "TRANSFERT">;
};

function MovementTooltip({
  active,
  payload,
  currency,
  movementType,
}: MovementTooltipProps) {
  const point = payload?.[0]?.payload as DailyTotalPoint | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-xl border border-(--color-line) bg-(--color-surface) px-3 py-2 shadow-[0_12px_28px_-16px_rgba(2,44,34,0.45)] backdrop-blur-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-(--color-muted)">
        {formatDate(point.date)}
      </p>
      <div className="mt-2 flex items-center justify-between gap-6">
        <span className="text-xs text-(--color-muted)">
          {movementType === "EXPENSE" ? "Expenses" : "Income"}
        </span>
        <span className="text-xs font-bold font-mono text-(--color-ink)">
          {formatMoney(point.total.toFixed(2), currency)}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-(--color-muted)">
        Click to filter this day
      </p>
    </div>
  );
}

export function MovementBarChart({
  points,
  currency,
  movementType,
  selectedDay,
  onSelectDay,
}: MovementBarChartProps) {
  const barColor =
    movementType === "EXPENSE"
      ? "var(--color-negative)"
      : "var(--color-accent)";

  return (
    <div className="h-64 w-full cursor-pointer sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            tick={{
              fill: "var(--color-muted)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            minTickGap={16}
            interval="preserveStartEnd"
            dy={8}
          />
          <YAxis
            width={64}
            tickFormatter={(value) => formatAxisMoney(Number(value), currency)}
            tickLine={false}
            axisLine={false}
            tick={{
              fill: "var(--color-muted)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
            domain={[0, "auto"]}
          />
          <Tooltip
            cursor={{ fill: "var(--color-canvas)", radius: 6 }}
            content={(props) => (
              <MovementTooltip
                {...props}
                currency={currency}
                movementType={movementType}
              />
            )}
          />
          <Bar
            dataKey="total"
            name={movementType === "EXPENSE" ? "Expenses" : "Income"}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            minPointSize={2}
            onClick={(entry) => {
              const point = entry.payload as DailyTotalPoint | undefined;

              if (point?.date) {
                onSelectDay(point.date);
              }
            }}
          >
            {points.map((point) => {
              const isSelected = point.date === selectedDay;

              return (
                <Cell
                  key={point.date}
                  fill={barColor}
                  fillOpacity={selectedDay && !isSelected ? 0.3 : 1}
                  stroke={isSelected ? "var(--color-ink)" : "none"}
                  strokeWidth={isSelected ? 1.5 : 0}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
