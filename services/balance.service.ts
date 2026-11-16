import { prisma } from "@/libs/db/prisma";
import { AppError } from "@/libs/errors/app-error";
import { Prisma } from "../prisma/generated/client";
import type { AccountBalance, Balance } from "@/types/balance.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ZERO = new Prisma.Decimal(0);

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

function sum(amount: Prisma.Decimal | null): Prisma.Decimal {
  return amount ?? ZERO;
}

export async function getBalance(userIdHeader: string | null): Promise<Balance> {
  const userId = requireUserId(userIdHeader);
  const [accounts, byDestination, bySource] = await Promise.all([
    prisma.account.findMany({
      where: { id_user: userId },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.money_movements.groupBy({
      by: ["id_account", "movement_type"],
      where: { id_user: userId },
      _sum: { amount: true },
    }),
    prisma.money_movements.groupBy({
      by: ["id_account_source"],
      where: { id_user: userId, movement_type: "TRANSFERT" },
      _sum: { amount: true },
    }),
  ]);

  type AccountTotals = {
    income: Prisma.Decimal;
    expense: Prisma.Decimal;
    transferIn: Prisma.Decimal;
    transferOut: Prisma.Decimal;
  };

  const totalsById = new Map<string, AccountTotals>();
  for (const account of accounts) {
    totalsById.set(account.id, {
      income: ZERO,
      expense: ZERO,
      transferIn: ZERO,
      transferOut: ZERO,
    });
  }

  let unassignedIncome = ZERO;
  let unassignedExpense = ZERO;

  for (const row of byDestination) {
    const amount = sum(row._sum.amount);

    if (row.id_account === null) {
      if (row.movement_type === "INCOME") {
        unassignedIncome = unassignedIncome.plus(amount);
      } else if (row.movement_type === "EXPENSE") {
        unassignedExpense = unassignedExpense.plus(amount);
      }
      continue;
    }

    const totals = totalsById.get(row.id_account);
    if (!totals) {
      continue;
    }

    if (row.movement_type === "INCOME") {
      totals.income = totals.income.plus(amount);
    } else if (row.movement_type === "EXPENSE") {
      totals.expense = totals.expense.plus(amount);
    } else if (row.movement_type === "TRANSFERT") {
      totals.transferIn = totals.transferIn.plus(amount);
    }
  }

  for (const row of bySource) {
    if (row.id_account_source === null) {
      continue;
    }

    const totals = totalsById.get(row.id_account_source);
    if (totals) {
      totals.transferOut = totals.transferOut.plus(sum(row._sum.amount));
    }
  }

  const accountsBalance: AccountBalance[] = [];
  let globalIncome = unassignedIncome;
  let globalExpense = unassignedExpense;
  let globalBalance = unassignedIncome.minus(unassignedExpense);

  for (const account of accounts) {
    const totals = totalsById.get(account.id)!;
    const balance = totals.income
      .minus(totals.expense)
      .plus(totals.transferIn)
      .minus(totals.transferOut);

    accountsBalance.push({
      id_account: account.id,
      name: account.name,
      income: totals.income.toFixed(2),
      expense: totals.expense.toFixed(2),
      balance: balance.toFixed(2),
    });

    globalIncome = globalIncome.plus(totals.income);
    globalExpense = globalExpense.plus(totals.expense);
    globalBalance = globalBalance.plus(balance);
  }

  return {
    income: globalIncome.toFixed(2),
    expense: globalExpense.toFixed(2),
    balance: globalBalance.toFixed(2),
    accounts: accountsBalance,
  };
}
