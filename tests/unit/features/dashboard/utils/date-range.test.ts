import { describe, expect, it } from "vitest";
import type { MoneyMovement } from "@/types/money-movement.types";
import {
  aggregateDailyTotals,
  buildDateRange,
  resolveMovementRange,
} from "@/features/dashboard/utils/date-range";

const NOW = new Date("2026-11-23T15:30:00.000Z");

function makeMovement(
  overrides: Partial<MoneyMovement> = {},
): MoneyMovement {
  return {
    id: "movement-1",
    id_user: "user-1",
    id_category: null,
    movement_type: "EXPENSE",
    id_account: null,
    id_account_source: null,
    title: "Coffee",
    description: null,
    amount: "10.00",
    logged_for: "2026-11-20",
    logged_at: null,
    ...overrides,
  };
}

describe("resolveMovementRange", () => {
  it("defaults to the last seven days", () => {
    expect(resolveMovementRange("", "", NOW)).toEqual({
      from: "2026-11-17",
      to: "2026-11-23",
    });
  });

  it("uses a start date through today when only the start is set", () => {
    expect(resolveMovementRange("2026-11-01", "", NOW)).toEqual({
      from: "2026-11-01",
      to: "2026-11-23",
    });
  });

  it("uses the seven days ending on the end date when only the end is set", () => {
    expect(resolveMovementRange("", "2026-11-20", NOW)).toEqual({
      from: "2026-11-14",
      to: "2026-11-20",
    });
  });

  it("keeps an explicit valid range", () => {
    expect(
      resolveMovementRange("2026-10-01", "2026-10-31", NOW),
    ).toEqual({
      from: "2026-10-01",
      to: "2026-10-31",
    });
  });

  it("keeps a future start date as a single day", () => {
    expect(resolveMovementRange("2026-12-01", "", NOW)).toEqual({
      from: "2026-12-01",
      to: "2026-12-01",
    });
  });

  it("rejects an inverted range", () => {
    expect(
      resolveMovementRange("2026-11-20", "2026-11-10", NOW),
    ).toBeNull();
  });

  it("rejects invalid dates", () => {
    expect(resolveMovementRange("not-a-date", "", NOW)).toBeNull();
  });
});

describe("buildDateRange", () => {
  it("builds an inclusive list of dates", () => {
    expect(
      buildDateRange("2026-11-20", "2026-11-23"),
    ).toEqual([
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
      "2026-11-23",
    ]);
  });

  it("returns an empty list for an inverted range", () => {
    expect(buildDateRange("2026-11-23", "2026-11-20")).toEqual([]);
  });
});

describe("aggregateDailyTotals", () => {
  const dates = ["2026-11-19", "2026-11-20", "2026-11-21"];

  it("fills days without movements with zero", () => {
    expect(aggregateDailyTotals(dates, [])).toEqual([
      { date: "2026-11-19", total: 0 },
      { date: "2026-11-20", total: 0 },
      { date: "2026-11-21", total: 0 },
    ]);
  });

  it("sums amounts per day and ignores dates outside the range", () => {
    expect(
      aggregateDailyTotals(dates, [
        makeMovement({ id: "1", amount: "12.50" }),
        makeMovement({ id: "2", amount: "7.50" }),
        makeMovement({ id: "3", amount: "99.00", logged_for: "2026-11-18" }),
        makeMovement({ id: "4", amount: "5.00", logged_for: null }),
      ]),
    ).toEqual([
      { date: "2026-11-19", total: 0 },
      { date: "2026-11-20", total: 20 },
      { date: "2026-11-21", total: 0 },
    ]);
  });

  it("rounds floating point sums to cents", () => {
    expect(
      aggregateDailyTotals(["2026-11-20"], [
        makeMovement({ id: "1", amount: "0.10" }),
        makeMovement({ id: "2", amount: "0.20" }),
      ]),
    ).toEqual([{ date: "2026-11-20", total: 0.3 }]);
  });
});
