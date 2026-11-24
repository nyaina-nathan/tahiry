import {
  EMAIL_COLORS,
  escapeHtml,
  renderEmailDocument,
  renderEmailSectionTitle,
  renderEmailText,
} from "./email-layout";

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

export type WeeklyEmailOptions = {
  settingsUrl?: string;
};

const FONT_FAMILY =
  "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function getMondayBasedDay(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

function renderStatCard(
  label: string,
  value: string,
  palette: {
    background: string;
    border: string;
    label: string;
    value: string;
  },
): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${palette.background}" style="width:100%;border-collapse:separate;background-color:${palette.background};border:1px solid ${palette.border};border-radius:12px;">
    <tr>
      <td style="padding:16px 18px;font-family:${FONT_FAMILY};">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;line-height:1.4;color:${palette.label};text-transform:uppercase;">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:19px;font-weight:700;line-height:1.3;color:${palette.value};">${escapeHtml(value)}</p>
      </td>
    </tr>
  </table>`;
}

function renderTotals(summary: WeeklyEmailSummary): string {
  const income = `${summary.totals.income} ${summary.currency}`;
  const expense = `${summary.totals.expense} ${summary.currency}`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px;border-collapse:separate;">
    <tr>
      <td class="email-stat-cell" width="50%" valign="top" style="padding-right:6px;">
        ${renderStatCard("Total income", income, {
          background: EMAIL_COLORS.accentSoft,
          border: EMAIL_COLORS.accentSoftLine,
          label: "#047857",
          value: EMAIL_COLORS.accent,
        })}
      </td>
      <td class="email-stat-cell" width="50%" valign="top" style="padding-left:6px;">
        ${renderStatCard("Total spending", expense, {
          background: EMAIL_COLORS.negativeSoft,
          border: EMAIL_COLORS.negativeLine,
          label: EMAIL_COLORS.negative,
          value: "#991b1b",
        })}
      </td>
    </tr>
  </table>`;
}

const TABLE_STYLE = `width:100%;border-collapse:separate;border:1px solid ${EMAIL_COLORS.line};border-radius:10px;margin:0 0 28px;`;
const HEADER_CELL_STYLE = `padding:10px 12px;font-family:${FONT_FAMILY};font-size:11px;font-weight:700;letter-spacing:0.06em;line-height:1.4;color:${EMAIL_COLORS.muted};text-transform:uppercase;`;
const CELL_STYLE = `padding:11px 12px;font-family:${FONT_FAMILY};font-size:13px;line-height:1.5;color:${EMAIL_COLORS.body};border-top:1px solid ${EMAIL_COLORS.line};`;

function renderDailyTable(summary: WeeklyEmailSummary): string {
  const dailyRows = summary.daily
    .map((day, index) => {
      const background =
        index % 2 === 0 ? EMAIL_COLORS.surface : EMAIL_COLORS.subtleSurface;

      return `<tr bgcolor="${background}">
        <td style="${CELL_STYLE}">${escapeHtml(day.date)}</td>
        <td align="right" style="${CELL_STYLE}color:${EMAIL_COLORS.accent};">${escapeHtml(day.income)}</td>
        <td align="right" style="${CELL_STYLE}color:${EMAIL_COLORS.negative};">${escapeHtml(day.expense)}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${TABLE_STYLE}">
    <thead>
      <tr bgcolor="${EMAIL_COLORS.subtleSurface}">
        <th align="left" style="${HEADER_CELL_STYLE}">Date</th>
        <th align="right" style="${HEADER_CELL_STYLE}">Income (${escapeHtml(summary.currency)})</th>
        <th align="right" style="${HEADER_CELL_STYLE}">Spending (${escapeHtml(summary.currency)})</th>
      </tr>
    </thead>
    <tbody>${dailyRows}</tbody>
  </table>`;
}

function renderCategoryRows(
  categories: WeeklyEmailCategory[],
  currency: string,
): string {
  if (categories.length === 0) {
    return `<tr><td colspan="2" style="${CELL_STYLE}">No data</td></tr>`;
  }

  return categories
    .map(
      (category, index) =>
        `<tr bgcolor="${index % 2 === 0 ? EMAIL_COLORS.surface : EMAIL_COLORS.subtleSurface}">
          <td style="${CELL_STYLE}">${escapeHtml(category.name)}</td>
          <td align="right" style="${CELL_STYLE}color:${EMAIL_COLORS.ink};font-weight:600;">${escapeHtml(category.amount)} ${escapeHtml(currency)}</td>
        </tr>`,
    )
    .join("");
}

function renderCategoryTable(
  categories: WeeklyEmailCategory[],
  currency: string,
): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${TABLE_STYLE}">
    <thead>
      <tr bgcolor="${EMAIL_COLORS.subtleSurface}">
        <th align="left" style="${HEADER_CELL_STYLE}">Category</th>
        <th align="right" style="${HEADER_CELL_STYLE}">Amount (${escapeHtml(currency)})</th>
      </tr>
    </thead>
    <tbody>${renderCategoryRows(categories, currency)}</tbody>
  </table>`;
}

export function buildWeeklySummaryHtml(
  summary: WeeklyEmailSummary,
  options: WeeklyEmailOptions = {},
): string {
  const content = [
    renderEmailText(`Hi ${summary.username},`),
    renderEmailText(
      `Here is your summary from ${summary.range.from} to ${summary.range.to}.`,
    ),
    renderTotals(summary),
    renderEmailSectionTitle("Daily activity"),
    renderDailyTable(summary),
    renderEmailSectionTitle("Top income categories"),
    renderCategoryTable(summary.topIncomeCategories, summary.currency),
    renderEmailSectionTitle("Top spending categories"),
    renderCategoryTable(summary.topExpenseCategories, summary.currency),
  ].join("");

  return renderEmailDocument({
    preheader: `Your Tahiry weekly summary for ${summary.range.from} to ${summary.range.to}.`,
    heading: "Your week in money",
    content,
    footerNote:
      "You received this email because you scheduled a weekly summary in Tahiry.",
    footerLink: options.settingsUrl
      ? {
          url: options.settingsUrl,
          label: "Manage email reminders",
        }
      : undefined,
  });
}

function categoryLines(
  title: string,
  categories: WeeklyEmailCategory[],
  currency: string,
): string[] {
  const lines =
    categories.length === 0
      ? ["No data"]
      : categories.map(
          (category) => `- ${category.name}: ${category.amount} ${currency}`,
        );

  return [title, ...lines, ""];
}

export function buildWeeklySummaryText(
  summary: WeeklyEmailSummary,
  options: WeeklyEmailOptions = {},
): string {
  const dailyLines =
    summary.daily.length === 0
      ? ["No activity recorded."]
      : summary.daily.map(
          (day) =>
            `- ${day.date}: income ${day.income} ${summary.currency}, spending ${day.expense} ${summary.currency}`,
        );

  const lines = [
    "Your week in money",
    "",
    `Hi ${summary.username},`,
    "",
    `Here is your summary from ${summary.range.from} to ${summary.range.to}.`,
    "",
    "Totals",
    `- Total income: ${summary.totals.income} ${summary.currency}`,
    `- Total spending: ${summary.totals.expense} ${summary.currency}`,
    "",
    "Daily activity",
    ...dailyLines,
    "",
    ...categoryLines(
      "Top income categories",
      summary.topIncomeCategories,
      summary.currency,
    ),
    ...categoryLines(
      "Top spending categories",
      summary.topExpenseCategories,
      summary.currency,
    ),
    ...(options.settingsUrl
      ? [`Manage email reminders: ${options.settingsUrl}`, ""]
      : []),
    "Tahiry - Every coin, in plain sight.",
  ];

  return lines.join("\n");
}
