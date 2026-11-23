import type { MoneyMovement } from "@/types/money-movement.types";

export const DEFAULT_CHART_DAYS = 7;

const DAY_MS = 86_400_000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type DateRange = {
  from: string;
  to: string;
};

export type DailyTotalPoint = {
  date: string;
  total: number;
};

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isValidDateOnly(value: string): boolean {
  return (
    DATE_PATTERN.test(value) && !Number.isNaN(toUtcDate(value).getTime())
  );
}

function addDays(date: string, days: number): string {
  return formatUtcDate(
    new Date(toUtcDate(date).getTime() + days * DAY_MS),
  );
}

export function buildDateRange(from: string, to: string): string[] {
  if (!isValidDateOnly(from) || !isValidDateOnly(to) || from > to) {
    return [];
  }

  const dates: string[] = [];

  for (
    let time = toUtcDate(from).getTime();
    time <= toUtcDate(to).getTime();
    time += DAY_MS
  ) {
    dates.push(formatUtcDate(new Date(time)));
  }

  return dates;
}

export function resolveMovementRange(
  from: string,
  to: string,
  now = new Date(),
): DateRange | null {
  const today = formatUtcDate(
    new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    ),
  );

  if (from && !isValidDateOnly(from)) {
    return null;
  }

  if (to && !isValidDateOnly(to)) {
    return null;
  }

  if (!from && !to) {
    return {
      from: addDays(today, -(DEFAULT_CHART_DAYS - 1)),
      to: today,
    };
  }

  if (from && !to) {
    return {
      from,
      to: from <= today ? today : from,
    };
  }

  if (!from && to) {
    return {
      from: addDays(to, -(DEFAULT_CHART_DAYS - 1)),
      to,
    };
  }

  if (from > to) {
    return null;
  }

  return { from, to };
}

export function aggregateDailyTotals(
  dates: string[],
  movements: MoneyMovement[],
): DailyTotalPoint[] {
  const totals = new Map<string, number>(
    dates.map((date) => [date, 0]),
  );

  for (const movement of movements) {
    const amount = Number(movement.amount);

    if (!movement.logged_for || !Number.isFinite(amount)) {
      continue;
    }

    const current = totals.get(movement.logged_for);

    if (current === undefined) {
      continue;
    }

    totals.set(
      movement.logged_for,
      Math.round((current + amount) * 100) / 100,
    );
  }

  return dates.map((date) => ({
    date,
    total: totals.get(date) ?? 0,
  }));
}
