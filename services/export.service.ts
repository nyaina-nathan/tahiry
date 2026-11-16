import ExcelJS from "exceljs";
import { prisma } from "@/libs/db/prisma";
import { AppError } from "@/libs/errors/app-error";
import type { ExportInput } from "@/validators/export.validator";
import type { Prisma } from "../prisma/generated/client";

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

function toDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatAccount(
  movementType: string,
  accountName: string | undefined,
  sourceAccountName: string | undefined,
): string {
  if (movementType === "TRANSFERT") {
    return [sourceAccountName, accountName]
      .filter(Boolean)
      .join(" → ");
  }

  return accountName ?? "";
}

export async function createMoneyMovementsExport(
  userIdHeader: string | null,
  input: ExportInput,
): Promise<ArrayBuffer> {
  const userId = requireUserId(userIdHeader);

  const movements = await prisma.money_movements.findMany({
    where: {
      id_user: userId,
      ...(input.from === undefined && input.to === undefined
        ? {}
        : {
            logged_for: {
              ...(input.from === undefined
                ? {}
                : { gte: toDateOnly(input.from) }),
              ...(input.to === undefined ? {} : { lte: toDateOnly(input.to) }),
            },
          }),
    },
    orderBy: [
      { logged_for: "asc" },
      { logged_at: "asc" },
      { id: "asc" },
    ],
    select: movementExportSelect,
  });

  const categoryIds = movements
    .map((movement) => movement.id_category)
    .filter((id): id is string => id !== null);
  const accountIds = movements
    .flatMap((movement) => [movement.id_account, movement.id_account_source])
    .filter((id): id is string => id !== null);

  const [categories, accounts] = await Promise.all([
    prisma.categories.findMany({
      where: { id_user: userId, id: { in: categoryIds } },
      select: { id: true, cat_name: true },
    }),
    prisma.account.findMany({
      where: { id_user: userId, id: { in: accountIds } },
      select: { id: true, name: true },
    }),
  ]);

  const categoryNames = new Map(categories.map((category) => [category.id, category.cat_name]));
  const accountNames = new Map(accounts.map((account) => [account.id, account.name]));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Money movements");

  worksheet.columns = [
    { header: "title", key: "title", width: 32 },
    { header: "category", key: "category", width: 24 },
    { header: "account", key: "account", width: 28 },
    { header: "amount", key: "amount", width: 14 },
    { header: "type", key: "type", width: 12 },
    { header: "date", key: "date", width: 14 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getColumn("amount").numFmt = "0.00";
  worksheet.getColumn("date").numFmt = "yyyy-mm-dd";

  let totalMoneyMovedInCents = 0;
  let totalExpenseInCents = 0;
  let totalIncomeInCents = 0;

  for (const movement of movements) {
    const amountInCents = Math.round(Number(movement.amount) * 100);
    totalMoneyMovedInCents += amountInCents;

    if (movement.movement_type === "EXPENSE") {
      totalExpenseInCents += amountInCents;
    } else if (movement.movement_type === "INCOME") {
      totalIncomeInCents += amountInCents;
    }

    worksheet.addRow({
      title: movement.title,
      category: movement.id_category
        ? (categoryNames.get(movement.id_category) ?? "")
        : "",
      account: formatAccount(
        movement.movement_type,
        movement.id_account
          ? accountNames.get(movement.id_account)
          : undefined,
        movement.id_account_source
          ? accountNames.get(movement.id_account_source)
          : undefined,
      ),
      amount: Number(movement.amount.toFixed(2)),
      type:
        movement.movement_type === "TRANSFERT"
          ? "transfer"
          : movement.movement_type.toLowerCase(),
      date: movement.logged_for ?? null,
    });
  }

  worksheet.addRow([]);
  const summaryRows = [
    ["Total money moved", totalMoneyMovedInCents],
    ["Total expense", totalExpenseInCents],
    ["Total income", totalIncomeInCents],
  ];

  for (const [label, amountInCents] of summaryRows) {
    const row = worksheet.addRow({
      title: label,
      amount: Number(amountInCents) / 100,
    });
    row.font = { bold: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const output = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(output).set(new Uint8Array(buffer));
  return output;
}

const movementExportSelect = {
  id_category: true,
  id_account: true,
  id_account_source: true,
  title: true,
  movement_type: true,
  amount: true,
  logged_for: true,
} satisfies Prisma.money_movementsSelect;
