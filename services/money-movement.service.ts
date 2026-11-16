import { prisma } from "@/libs/db/prisma";
import { AppError } from "@/libs/errors/app-error";
import type { Prisma } from "../prisma/generated/client";
import type {
  MoneyMovement,
  MovementFilters,
  MovementInput,
  MovementPage,
  MovementPatch,
  MovementType,
} from "@/types/money-movement.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const movementSelect = {
  id: true,
  id_user: true,
  id_category: true,
  movement_type: true,
  id_account: true,
  id_account_source: true,
  title: true,
  description: true,
  amount: true,
  logged_for: true,
  logged_at: true,
} as const;

export type StoredMovement = {
  id: string;
  id_user: string;
  id_category: string | null;
  movement_type: string;
  id_account: string | null;
  id_account_source: string | null;
  title: string;
  description: string | null;
  amount: Prisma.Decimal;
  logged_for: Date | null;
  logged_at: Date | null;
};

function unauthorizedError(): AppError {
  return new AppError(
    "Unauthorized",
    "Authentication is missing or invalid.",
    401,
    "authentication",
  );
}

function movementNotFoundError(): AppError {
  return new AppError(
    "Not Found",
    "Money movement not found.",
    404,
    "money-movement",
  );
}

function categoryNotFoundError(): AppError {
  return new AppError(
    "Not Found",
    "Category not found.",
    404,
    "category",
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

function requireUserId(userId: string | null): string {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw unauthorizedError();
  }

  return userId;
}

function requireMovementId(movementId: string): string {
  if (!UUID_PATTERN.test(movementId)) {
    throw movementNotFoundError();
  }

  return movementId;
}

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateTime(value: string): Date {
  return new Date(value);
}

function formatDateOnly(value: Date | null): string | null {
  return value === null ? null : value.toISOString().slice(0, 10);
}

export function toMoneyMovement(movement: StoredMovement): MoneyMovement {
  return {
    id: movement.id,
    id_user: movement.id_user,
    id_category: movement.id_category,
    movement_type: movement.movement_type as MovementType,
    id_account: movement.id_account,
    id_account_source: movement.id_account_source,
    title: movement.title,
    description: movement.description,
    amount: movement.amount.toFixed(2),
    logged_for: formatDateOnly(movement.logged_for),
    logged_at: movement.logged_at?.toISOString() ?? null,
  };
}

async function ensureCategoryBelongsToUser(
  userId: string,
  categoryId: string | null | undefined,
): Promise<void> {
  if (categoryId === undefined || categoryId === null) {
    return;
  }

  if (!UUID_PATTERN.test(categoryId)) {
    throw categoryNotFoundError();
  }

  const category = await prisma.categories.findFirst({
    where: { id: categoryId, id_user: userId },
    select: { id: true },
  });

  if (!category) {
    throw categoryNotFoundError();
  }
}

async function ensureAccountBelongsToUser(
  userId: string,
  accountId: string | null | undefined,
): Promise<void> {
  if (accountId === undefined || accountId === null) {
    return;
  }

  if (!UUID_PATTERN.test(accountId)) {
    throw accountNotFoundError();
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, id_user: userId },
    select: { id: true },
  });

  if (!account) {
    throw accountNotFoundError();
  }
}

function buildMovementWhere(
  userId: string,
  filters: MovementFilters,
): Prisma.money_movementsWhereInput {
  return {
    id_user: userId,
    ...(filters.movementType === undefined
      ? {}
      : { movement_type: filters.movementType }),
    ...(filters.categoryId === undefined
      ? {}
      : { id_category: filters.categoryId }),
    ...(filters.accountId === undefined
      ? {}
      : {
          OR: [
            { id_account: filters.accountId },
            { id_account_source: filters.accountId },
          ],
        }),
    ...(filters.loggedForFrom === undefined && filters.loggedForTo === undefined
      ? {}
      : {
          logged_for: {
            ...(filters.loggedForFrom === undefined
              ? {}
              : { gte: toDateOnly(filters.loggedForFrom) }),
            ...(filters.loggedForTo === undefined
              ? {}
              : { lte: toDateOnly(filters.loggedForTo) }),
          },
        }),
  };
}

function toCreateData(
  userId: string,
  payload: MovementInput,
): Prisma.money_movementsUncheckedCreateInput {
  return {
    id_user: userId,
    ...(payload.id_category === undefined
      ? {}
      : { id_category: payload.id_category }),
    ...(payload.id_account === undefined
      ? {}
      : { id_account: payload.id_account }),
    ...(payload.movement_type === undefined
      ? {}
      : { movement_type: payload.movement_type }),
    title: payload.title,
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
  };
}

function toUpdateData(
  payload: MovementPatch,
): Prisma.money_movementsUpdateManyMutationInput {
  return {
    ...(payload.id_category === undefined
      ? {}
      : { id_category: payload.id_category }),
    ...(payload.movement_type === undefined
      ? {}
      : { movement_type: payload.movement_type }),
    ...(payload.title === undefined ? {} : { title: payload.title }),
    ...(payload.description === undefined
      ? {}
      : { description: payload.description }),
    ...(payload.amount === undefined ? {} : { amount: payload.amount }),
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
  };
}

export async function listMoneyMovements(
  userIdHeader: string | null,
  filters: MovementFilters,
): Promise<MovementPage> {
  const userId = requireUserId(userIdHeader);
  const where = buildMovementWhere(userId, filters);
  const [movements, total] = await prisma.$transaction([
    prisma.money_movements.findMany({
      where,
      orderBy: [
        { logged_for: "desc" },
        { logged_at: "desc" },
        { id: "desc" },
      ],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      select: movementSelect,
    }),
    prisma.money_movements.count({ where }),
  ]);

  return {
    items: movements.map(toMoneyMovement),
    page: filters.page,
    page_size: filters.pageSize,
    total,
  };
}

export async function createMoneyMovement(
  userIdHeader: string | null,
  payload: MovementInput,
): Promise<MoneyMovement> {
  const userId = requireUserId(userIdHeader);
  await ensureCategoryBelongsToUser(userId, payload.id_category);
  await ensureAccountBelongsToUser(userId, payload.id_account);
  const movement = await prisma.money_movements.create({
    data: toCreateData(userId, payload),
    select: movementSelect,
  });

  return toMoneyMovement(movement);
}

export async function getMoneyMovement(
  userIdHeader: string | null,
  movementId: string,
): Promise<MoneyMovement> {
  const userId = requireUserId(userIdHeader);
  const id = requireMovementId(movementId);
  const movement = await prisma.money_movements.findFirst({
    where: { id, id_user: userId },
    select: movementSelect,
  });

  if (!movement) {
    throw movementNotFoundError();
  }

  return toMoneyMovement(movement);
}

export async function updateMoneyMovement(
  userIdHeader: string | null,
  movementId: string,
  payload: MovementPatch,
): Promise<MoneyMovement> {
  const userId = requireUserId(userIdHeader);
  const id = requireMovementId(movementId);
  await ensureCategoryBelongsToUser(userId, payload.id_category);
  const result = await prisma.money_movements.updateMany({
    where: { id, id_user: userId },
    data: toUpdateData(payload),
  });

  if (result.count === 0) {
    throw movementNotFoundError();
  }

  return getMoneyMovement(userId, id);
}

export async function deleteMoneyMovement(
  userIdHeader: string | null,
  movementId: string,
): Promise<void> {
  const userId = requireUserId(userIdHeader);
  const id = requireMovementId(movementId);
  const result = await prisma.money_movements.deleteMany({
    where: { id, id_user: userId },
  });

  if (result.count === 0) {
    throw movementNotFoundError();
  }
}
