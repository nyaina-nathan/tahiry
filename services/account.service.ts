import { prisma } from "@/libs/db/prisma";
import { AppError } from "@/libs/errors/app-error";
import type {
  Account,
  AccountInput,
  AccountPatch,
} from "@/types/account.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const accountSelect = {
  id: true,
  id_user: true,
  name: true,
  created_at: true,
} as const;

function unauthorizedError(): AppError {
  return new AppError(
    "Unauthorized",
    "Authentication is missing or invalid.",
    401,
    "authentication",
  );
}

function notFoundError(): AppError {
  return new AppError(
    "Not Found",
    "Account not found.",
    404,
    "account",
  );
}

function conflictError(): AppError {
  return new AppError(
    "Conflict",
    "An account with the same name already exists.",
    409,
    "account",
  );
}

function requireUserId(userId: string | null): string {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw unauthorizedError();
  }

  return userId;
}

function requireAccountId(accountId: string): string {
  if (!UUID_PATTERN.test(accountId)) {
    throw notFoundError();
  }

  return accountId;
}

function toAccount(account: {
  id: string;
  id_user: string;
  name: string;
  created_at: Date | null;
}): Account {
  return {
    ...account,
    created_at: account.created_at?.toISOString() ?? null,
  };
}

export async function listAccounts(
  userIdHeader: string | null,
): Promise<Account[]> {
  const userId = requireUserId(userIdHeader);
  const accounts = await prisma.account.findMany({
    where: { id_user: userId },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: accountSelect,
  });

  return accounts.map(toAccount);
}

async function assertNameAvailable(
  userId: string,
  name: string,
  excludeId?: string,
): Promise<void> {
  const existing = await prisma.account.findFirst({
    where: {
      id_user: userId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId === undefined ? {} : { id: { not: excludeId } }),
    },
    select: { id: true },
  });

  if (existing) {
    throw conflictError();
  }
}

export async function createAccount(
  userIdHeader: string | null,
  payload: AccountInput,
): Promise<Account> {
  const userId = requireUserId(userIdHeader);
  await assertNameAvailable(userId, payload.name);
  const account = await prisma.account.create({
    data: {
      id_user: userId,
      name: payload.name,
    },
    select: accountSelect,
  });

  return toAccount(account);
}

export async function getAccount(
  userIdHeader: string | null,
  accountId: string,
): Promise<Account> {
  const userId = requireUserId(userIdHeader);
  const id = requireAccountId(accountId);
  const account = await prisma.account.findFirst({
    where: { id, id_user: userId },
    select: accountSelect,
  });

  if (!account) {
    throw notFoundError();
  }

  return toAccount(account);
}

export async function updateAccount(
  userIdHeader: string | null,
  accountId: string,
  payload: AccountPatch,
): Promise<Account> {
  const userId = requireUserId(userIdHeader);
  const id = requireAccountId(accountId);
  await getAccount(userId, id);

  if (payload.name !== undefined) {
    await assertNameAvailable(userId, payload.name, id);
  }

  const result = await prisma.account.updateMany({
    where: { id, id_user: userId },
    data: payload,
  });

  if (result.count === 0) {
    throw notFoundError();
  }

  return getAccount(userId, id);
}

export async function deleteAccount(
  userIdHeader: string | null,
  accountId: string,
): Promise<void> {
  const userId = requireUserId(userIdHeader);
  const id = requireAccountId(accountId);
  const result = await prisma.account.deleteMany({
    where: { id, id_user: userId },
  });

  if (result.count === 0) {
    throw notFoundError();
  }
}
