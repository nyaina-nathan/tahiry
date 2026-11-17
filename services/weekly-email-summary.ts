export type WeeklyEmailCategory = {
  name: string;
  amount: string;
};

export type WeeklyEmailSummary = {
  username: string;
  currency: string;
  range: {
    from: string;
    to: string;
  };
  daily: Array<{
    date: string;
    income: string;
    expense: string;
  }>;
  totals: {
    income: string;
    expense: string;
  };
  topIncomeCategories: WeeklyEmailCategory[];
  topExpenseCategories: WeeklyEmailCategory[];
};

export function getMondayBasedDay(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCategoryRows(categories: WeeklyEmailCategory[]): string {
  if (categories.length === 0) {
    return "<tr><td colspan=\"2\">No data</td></tr>";
  }

  return categories
    .map(
      (category) =>
        `<tr><td>${escapeHtml(category.name)}</td><td>${escapeHtml(category.amount)}</td></tr>`,
    )
    .join("");
}

export function buildWeeklySummaryHtml(summary: WeeklyEmailSummary): string {
  const dailyRows = summary.daily
    .map(
      (day) =>
        `<tr><td>${escapeHtml(day.date)}</td><td>${escapeHtml(day.income)}</td><td>${escapeHtml(day.expense)}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
      <h1>Your weekly spending summary</h1>
      <p>Hi ${escapeHtml(summary.username)},</p>
      <p>Here is your summary from ${escapeHtml(summary.range.from)} to ${escapeHtml(summary.range.to)}.</p>

      <h2>Totals</h2>
      <ul>
        <li>Total income: <strong>${escapeHtml(summary.totals.income)} ${escapeHtml(summary.currency)}</strong></li>
        <li>Total spending: <strong>${escapeHtml(summary.totals.expense)} ${escapeHtml(summary.currency)}</strong></li>
      </ul>

      <h2>Daily activity</h2>
      <table cellpadding="8" cellspacing="0" border="1">
        <thead><tr><th>Date</th><th>Income</th><th>Spending</th></tr></thead>
        <tbody>${dailyRows}</tbody>
      </table>

      <h2>Top income categories</h2>
      <table cellpadding="8" cellspacing="0" border="1">
        <thead><tr><th>Category</th><th>Amount</th></tr></thead>
        <tbody>${renderCategoryRows(summary.topIncomeCategories)}</tbody>
      </table>

      <h2>Top spending categories</h2>
      <table cellpadding="8" cellspacing="0" border="1">
        <thead><tr><th>Category</th><th>Amount</th></tr></thead>
        <tbody>${renderCategoryRows(summary.topExpenseCategories)}</tbody>
      </table>
    </div>
  `;
}
