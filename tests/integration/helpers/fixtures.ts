import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import type { Prisma } from "@/prisma/generated/client";
import { prisma } from "./database";

export const TEST_PASSWORD = "correct horse battery staple";

const PASSWORD_HASH_ROUNDS = 4;
let passwordHashPromise: Promise<string> | undefined;

function getPasswordHash(): Promise<string> {
  passwordHashPromise ??= bcrypt.hash(TEST_PASSWORD, PASSWORD_HASH_ROUNDS);
  return passwordHashPromise;
}

export async function createUser(
  overrides: Partial<Prisma.usersUncheckedCreateInput> = {},
) {
  return prisma.users.create({
    data: {
      username: `User ${randomUUID().slice(0, 8)}`,
      email: `user-${randomUUID()}@example.com`,
      password_hash: await getPasswordHash(),
      currency: "USD",
      ...overrides,
    },
  });
}

export async function createAccount(userId: string, name = "Account") {
  return prisma.account.create({
    data: {
      id_user: userId,
      name,
    },
  });
}

export async function createCategory(
  userId: string,
  catName = "Category",
  catType: "EXPENSE" | "INCOME" = "EXPENSE",
) {
  return prisma.categories.create({
    data: {
      id_user: userId,
      cat_name: catName,
      cat_type: catType,
    },
  });
}

export async function createMovement(
  userId: string,
  overrides: Partial<Prisma.money_movementsUncheckedCreateInput> = {},
) {
  return prisma.money_movements.create({
    data: {
      id_user: userId,
      title: "Movement",
      amount: "10.00",
      movement_type: "EXPENSE",
      logged_for: new Date("2026-11-17T00:00:00.000Z"),
      ...overrides,
    },
  });
}

export async function createTransferMovement(
  userId: string,
  sourceAccountId: string,
  destinationAccountId: string,
  amount = "10.00",
) {
  return createMovement(userId, {
    title: "Transfer",
    amount,
    movement_type: "TRANSFERT",
    id_account: destinationAccountId,
    id_account_source: sourceAccountId,
  });
}
