import { Resend } from "resend";
import { prisma } from "@/libs/db/prisma";
import { Prisma } from "../prisma/generated/client";
import {
  buildWeeklySummaryHtml,
  getMondayBasedDay,
} from "@/services/weekly-email-summary";

const RESEND_SUBJECT = "Your weekly summary";

type ReminderWithUser = {
  id_user: string;
  time: Date;
  users: {
    username: string;
    email: string;
    currency: string;
  };
};

type DailyStats = {
  date: string;
  income: Prisma.Decimal;
  expense: Prisma.Decimal;
};

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function scheduledAtForReminder(now: Date, reminderTime: Date): string {
  const scheduledAt = startOfUtcDay(now);
  const time = reminderTime.toISOString().slice(11, 19).split(":").map(Number);

  scheduledAt.setUTCHours(time[0], time[1], time[2], 0);
  return scheduledAt.toISOString();
}

function formatAmount(amount: Prisma.Decimal): string {
  return amount.toFixed(2);
}

async function getWeeklyStats(userId: string, now: Date) {
  const end = addDays(startOfUtcDay(now), 1);
  const from = addDays(end, -7);
  const daily = new Map<string, DailyStats>();

  for (let offset = 0; offset < 7; offset += 1) {
    const date = dateOnly(addDays(from, offset));
    daily.set(date, {
      date,
      income: new Prisma.Decimal(0),
      expense: new Prisma.Decimal(0),
    });
  }

  const movements = await prisma.money_movements.findMany({
    where: {
      id_user: userId,
      movement_type: { in: ["INCOME", "EXPENSE"] },
      logged_for: { gte: from, lt: end },
    },
    select: {
      amount: true,
      movement_type: true,
      logged_for: true,
      categories: { select: { cat_name: true } },
    },
  });

  let totalIncome = new Prisma.Decimal(0);
  let totalExpense = new Prisma.Decimal(0);
  const incomeCategories = new Map<string, Prisma.Decimal>();
  const expenseCategories = new Map<string, Prisma.Decimal>();

  for (const movement of movements) {
    const amount = movement.amount;
    const day = movement.logged_for
      ? daily.get(dateOnly(movement.logged_for))
      : undefined;

    if (movement.movement_type === "INCOME") {
      totalIncome = totalIncome.plus(amount);
      if (day) {
        day.income = day.income.plus(amount);
      }
      if (movement.categories) {
        incomeCategories.set(
          movement.categories.cat_name,
          (incomeCategories.get(movement.categories.cat_name) ??
            new Prisma.Decimal(0)).plus(amount),
        );
      }
    } else {
      totalExpense = totalExpense.plus(amount);
      if (day) {
        day.expense = day.expense.plus(amount);
      }
      if (movement.categories) {
        expenseCategories.set(
          movement.categories.cat_name,
          (expenseCategories.get(movement.categories.cat_name) ??
            new Prisma.Decimal(0)).plus(amount),
        );
      }
    }
  }

  const topCategories = (categories: Map<string, Prisma.Decimal>) =>
    [...categories.entries()]
      .sort(([, left], [, right]) => right.comparedTo(left))
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount: formatAmount(amount) }));

  return {
    range: {
      from: dateOnly(from),
      to: dateOnly(addDays(end, -1)),
    },
    daily: [...daily.values()].map((day) => ({
      date: day.date,
      income: formatAmount(day.income),
      expense: formatAmount(day.expense),
    })),
    totals: {
      income: formatAmount(totalIncome),
      expense: formatAmount(totalExpense),
    },
    topIncomeCategories: topCategories(incomeCategories),
    topExpenseCategories: topCategories(expenseCategories),
  };
}

export async function scheduleWeeklyEmails(now = new Date()) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured.");
  }

  const resend = new Resend(apiKey);
  const reminders = await prisma.weekly_reminder.findMany({
    where: { day_of_week: getMondayBasedDay(now) },
    select: {
      time: true,
      id_user: true,
      users: {
        select: {
          username: true,
          email: true,
          currency: true,
        },
      },
    },
  });

  let scheduled = 0;
  let failed = 0;

  for (const reminder of reminders as ReminderWithUser[]) {
    try {
      const stats = await getWeeklyStats(reminder.id_user, now);
      const result = await resend.emails.send({
        from,
        to: reminder.users.email,
        subject: RESEND_SUBJECT,
        scheduledAt: scheduledAtForReminder(now, reminder.time),
        html: buildWeeklySummaryHtml({
          username: reminder.users.username,
          currency: reminder.users.currency,
          ...stats,
        }),
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      scheduled += 1;
    } catch (error) {
      failed += 1;
      console.error("Failed to schedule weekly email", {
        userId: reminder.id_user,
        error,
      });
    }
  }

  return {
    matched: reminders.length,
    scheduled,
    failed,
  };
}
