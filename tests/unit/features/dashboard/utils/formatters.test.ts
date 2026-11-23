import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatAxisMoney,
  formatDate,
  formatMoney,
  formatWeekdayDate,
  today,
} from "@/features/dashboard/utils/formatters";

describe("today", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the current UTC date as YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T23:30:00.000Z"));

    expect(today()).toBe("2026-11-17");
  });

  it("uses the UTC date even when the local timezone is behind", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:30:00.000Z"));

    expect(today()).toBe("2026-01-01");
  });
});

describe("formatMoney", () => {
  it("formats an amount with its currency code", () => {
    expect(formatMoney("1234.5", "USD")).toMatch(/^USD\s1,234\.50$/);
    expect(formatMoney("0", "EUR")).toMatch(/^EUR\s0\.00$/);
  });

  it("always uses two fraction digits", () => {
    expect(formatMoney("42", "USD")).toMatch(/^USD\s42\.00$/);
    expect(formatMoney("42.005", "USD")).toMatch(/^USD\s42\.01$/);
  });

  it("falls back to MGA when the currency is empty", () => {
    expect(formatMoney("1000", "")).toMatch(/^MGA\s1,000\.00$/);
  });

  it("falls back to a plain string for unsupported currency codes", () => {
    expect(formatMoney("1234.5", "NOTACURRENCY")).toBe(
      "NOTACURRENCY 1234.5",
    );
  });
});

describe("formatAxisMoney", () => {
  it("formats compact currency values", () => {
    expect(formatAxisMoney(1234.5, "USD")).toBe("$1.2K");
    expect(formatAxisMoney(1500, "USD")).toBe("$1.5K");
  });

  it("formats small values without compact notation", () => {
    expect(formatAxisMoney(12, "USD")).toBe("$12");
    expect(formatAxisMoney(12.5, "USD")).toBe("$12.5");
  });

  it("falls back to a plain string for unsupported currency codes", () => {
    expect(formatAxisMoney(1234.5, "NOTACURRENCY")).toBe(
      "NOTACURRENCY 1234.5",
    );
  });
});

describe("formatWeekdayDate", () => {
  it("renders the weekday and day of month in UTC", () => {
    const formatted = formatWeekdayDate("2026-11-22");

    expect(formatted).toContain("Sun");
    expect(formatted).toContain("22");
  });
});

describe("formatDate", () => {
  it("renders a medium-format UTC date", () => {
    expect(formatDate("2026-11-22")).toBe("Nov 22, 2026");
  });

  it("returns a placeholder for missing dates", () => {
    expect(formatDate(null)).toBe("No date");
    expect(formatDate("")).toBe("No date");
  });
});
