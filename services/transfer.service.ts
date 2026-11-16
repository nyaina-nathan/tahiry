import { prisma } from "@/libs/db/prisma";
import { AppError } from "@/libs/errors/app-error";
import { Prisma } from "../prisma/generated/client";
import type { TransferInput } from "@/types/transfer.types";
import type { MoneyMovement } from "@/types/money-movement.types";
import {
  movementSelect,
  toMoneyMovement,
} from "@/services/money-movement.service";
import { isSufficientBalance } from "@/services/transfer-balance";

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

function accountNotFoundError(): AppError {
  return new AppError(
    "Not Found",
    "Account not found.",
    404,
    "account",
  );
}

function insufficientFundsError(): AppError {
  return new AppError(
    "Conflict",
    "The source account does not have enough funds for this transfer.",
    409,
    "transfer",
  );
}

function requireUserId(userId: string | null): string {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw unauthorizedError();
  }

  return userId;
}

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateTime(value: string): Date {
  return new Date(value);
}

async function ensureAccountsBelongToUser(
  userId: string,
  sourceId: string,
  destinationId: string,
): Promise<{ id: string; name: string }[]> {
  const accounts = await prisma.account.findMany({
    where: { id_user: userId, id: { in: [sourceId, destinationId] } },
    select: { id: true, name: true },
  });

  if (accounts.length !== 2) {
    throw accountNotFoundError();
  }

  return accounts;
}

async function getSourceBalance(
  userId: string,
  sourceId: string,
): Promise<Prisma.Decimal> {
  const [byDestination, bySource] = await Promise.all([
    prisma.money_movements.groupBy({
      by: ["movement_type"],
      where: { id_user: userId, id_account: sourceId },
      _sum: { amount: true },
    }),
    prisma.money_movements.aggregate({
      where: {
        id_user: userId,
        id_account_source: sourceId,
        movement_type: "TRANSFERT",
      },
      _sum: { amount: true },
    }),
  ]);

  let balance = new Prisma.Decimal(0);

  for (const row of byDestination) {
    const amount = row._sum.amount ?? new Prisma.Decimal(0);

    if (row.movement_type === "INCOME" || row.movement_type === "TRANSFERT") {
      balance = balance.plus(amount);
    } else if (row.movement_type === "EXPENSE") {
      balance = balance.minus(amount);
    }
  }

  return balance.minus(bySource._sum.amount ?? new Prisma.Decimal(0));
}

export async function createTransfer(
  userIdHeader: string | null,
  payload: TransferInput,
): Promise<MoneyMovement> {
  const userId = requireUserId(userIdHeader);
  const accounts = await ensureAccountsBelongToUser(
    userId,
    payload.id_account_source,
    payload.id_account,
  );
  const sourceBalance = await getSourceBalance(
    userId,
    payload.id_account_source,
  );

  if (!isSufficientBalance(sourceBalance.toFixed(2), payload.amount)) {
    throw insufficientFundsError();
  }

  const destination = accounts.find(
    (account) => account.id === payload.id_account,
  );
  const title = payload.title ?? `Transfer to ${destination?.name ?? ""}`;

  const movement = await prisma.money_movements.create({
    data: {
      id_user: userId,
      movement_type: "TRANSFERT",
      id_account: payload.id_account,
      id_account_source: payload.id_account_source,
      title,
      ...(payload.description === undefined
        ? {}
        : { description: payload.description }),
      amount: payload.amount,
      ...(payload.logged_for === undefined
        ? {}
        : {
            logged_for:
              payload.logged_for === null
                ? null
                : toDateOnly(payload.logged_for),
          }),
      ...(payload.logged_at === undefined
        ? {}
        : {
            logged_at:
              payload.logged_at === null
                ? null
                : toDateTime(payload.logged_at),
          }),
    },
    select: movementSelect,
  });

  return toMoneyMovement(movement);
}
