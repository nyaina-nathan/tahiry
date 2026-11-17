import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { buildWeeklySummaryHtml, getMondayBasedDay } from "./weekly-email-summary.ts";

test("maps Sunday to day 6 in the reminder weekday convention", () => {
  assert.equal(getMondayBasedDay(new Date("2026-11-22T00:00:00.000Z")), 6);
});

test("builds an HTML summary with totals, daily values, and top categories", () => {
  const html = buildWeeklySummaryHtml({
    username: "Ada",
    currency: "USD",
    range: {
      from: "2026-11-16",
      to: "2026-11-22",
    },
    daily: [
      { date: "2026-11-22", income: "100.00", expense: "25.00" },
    ],
    totals: {
      income: "100.00",
      expense: "25.00",
    },
    topIncomeCategories: [{ name: "Salary", amount: "100.00" }],
    topExpenseCategories: [{ name: "Food", amount: "25.00" }],
  });

  assert.match(html, /Hi Ada/);
  assert.match(html, /Total income/);
  assert.match(html, /Salary/);
  assert.match(html, /Food/);
  assert.match(html, /2026-11-22/);
});
