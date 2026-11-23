import { describe, expect, it } from "vitest";
import {
  buildWeeklySummaryHtml,
  getMondayBasedDay,
  type WeeklyEmailSummary,
} from "@/services/weekly-email-summary";

function makeSummary(
  overrides: Partial<WeeklyEmailSummary> = {},
): WeeklyEmailSummary {
  return {
    username: "Ada",
    currency: "USD",
    range: { from: "2026-11-16", to: "2026-11-22" },
    daily: [{ date: "2026-11-22", income: "100.00", expense: "25.00" }],
    totals: { income: "100.00", expense: "25.00" },
    topIncomeCategories: [{ name: "Salary", amount: "100.00" }],
    topExpenseCategories: [{ name: "Food", amount: "25.00" }],
    ...overrides,
  };
}

describe("getMondayBasedDay", () => {
  it("maps Monday to 0 and Sunday to 6", () => {
    const monday = new Date("2026-11-16T00:00:00.000Z");
    const sunday = new Date("2026-11-22T00:00:00.000Z");

    expect(getMondayBasedDay(monday)).toBe(0);
    expect(getMondayBasedDay(sunday)).toBe(6);
  });

  it("maps every weekday in the expected order", () => {
    const days = Array.from({ length: 7 }, (_, index) =>
      getMondayBasedDay(new Date(Date.UTC(2026, 10, 16 + index))),
    );

    expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe("buildWeeklySummaryHtml", () => {
  it("renders the range, totals, daily values, and top categories", () => {
    const html = buildWeeklySummaryHtml(makeSummary());

    expect(html).toContain("Hi Ada,");
    expect(html).toContain("from 2026-11-16 to 2026-11-22");
    expect(html).toContain("Total income: <strong>100.00 USD</strong>");
    expect(html).toContain("Total spending: <strong>25.00 USD</strong>");
    expect(html).toContain(
      "<tr><td>2026-11-22</td><td>100.00</td><td>25.00</td></tr>",
    );
    expect(html).toContain("<tr><td>Salary</td><td>100.00</td></tr>");
    expect(html).toContain("<tr><td>Food</td><td>25.00</td></tr>");
  });

  it("renders a placeholder when a category list is empty", () => {
    const html = buildWeeklySummaryHtml(
      makeSummary({ topIncomeCategories: [], topExpenseCategories: [] }),
    );

    expect(html.match(/<tr><td colspan="2">No data<\/td><\/tr>/g)).toHaveLength(2);
  });

  it("escapes user-provided values before interpolating them into HTML", () => {
    const html = buildWeeklySummaryHtml(
      makeSummary({
        username: `<script>alert("x")</script>`,
        range: { from: "<from>", to: "&to" },
        totals: { income: `1'2"`, expense: "<3>" },
        daily: [{ date: "<date>", income: "&1", expense: ">2" }],
        topIncomeCategories: [{ name: "<Income>", amount: `'"&` }],
        topExpenseCategories: [{ name: "Expense & Co", amount: "1<2" }],
      }),
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;from&gt;");
    expect(html).toContain("&amp;to");
    expect(html).toContain("1&#039;2&quot;");
    expect(html).toContain("&lt;3&gt;");
    expect(html).toContain("&lt;date&gt;");
    expect(html).toContain("&amp;1");
    expect(html).toContain("&gt;2");
    expect(html).toContain("&lt;Income&gt;");
    expect(html).toContain("Expense &amp; Co");
  });

  it("omits daily rows when there is no activity", () => {
    const html = buildWeeklySummaryHtml(makeSummary({ daily: [] }));

    expect(html).toContain("<tbody></tbody>");
  });
});
