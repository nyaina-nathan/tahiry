import { prisma } from "@/libs/db/prisma";
import { AppError } from "@/libs/errors/app-error";
import { Prisma } from "../prisma/generated/client";
import type { Balance } from "@/types/balance.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function unauthorizedError(): AppError {
  return new AppError(
    "Unauthorized",
    "Authentication is missing or invalid.",
    401,
    "authentication",
  );
}

function requireUserId(userId: string | null): string {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw unauthorizedError();
  }

  return userId;
}

export async function getBalance(userIdHeader: string | null): Promise<Balance> {
  const userId = requireUserId(userIdHeader);
  const totals = await prisma.money_movements.groupBy({
    by: ["movement_type"],
    where: { id_user: userId },
    _sum: { amount: true },
  });

  let income = new Prisma.Decimal(0);
  let expense = new Prisma.Decimal(0);

  for (const total of totals) {
    const amount = total._sum.amount ?? new Prisma.Decimal(0);

    if (total.movement_type === "INCOME") {
      income = income.plus(amount);
    } else if (total.movement_type === "EXPENSE") {
      expense = expense.plus(amount);
    }
  }

  return {
    income: income.toFixed(2),
    expense: expense.toFixed(2),
    balance: income.minus(expense).toFixed(2),
  };
}
