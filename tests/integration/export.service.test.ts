import ExcelJS from "exceljs";
import { beforeEach, describe, expect, it } from "vitest";
import { createMoneyMovementsExport } from "@/services/export.service";
import { resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import {
  createAccount,
  createCategory,
  createMovement,
  createTransferMovement,
  createUser,
} from "./helpers/fixtures";

beforeEach(resetDatabase);

async function readSheet(buffer: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.getWorksheet("Money movements");

  if (!worksheet) {
    throw new Error("The export did not contain the expected worksheet.");
  }

  return worksheet;
}

function cellDate(value: ExcelJS.CellValue): string | null {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    return new Date(Date.UTC(1899, 11, 30) + value * 86_400_000)
      .toISOString()
      .slice(0, 10);
  }

  return null;
}

async function setup() {
  const user = await createUser();
  const cash = await createAccount(user.id, "Cash");
  const savings = await createAccount(user.id, "Savings");
  const food = await createCategory(user.id, "Food", "EXPENSE");
  const salary = await createCategory(user.id, "Salary", "INCOME");

  return { user, cash, savings, food, salary };
}

describe("createMoneyMovementsExport", () => {
  it("writes the movement rows and summary totals", async () => {
    const { user, cash, food } = await setup();
    await createMovement(user.id, {
      title: "Lunch",
      amount: "12.34",
      movement_type: "EXPENSE",
      id_account: cash.id,
      id_category: food.id,
      logged_for: new Date("2026-11-10T00:00:00.000Z"),
    });
    await createMovement(user.id, {
      title: "Salary",
      amount: "100.00",
      movement_type: "INCOME",
      id_account: cash.id,
      logged_for: new Date("2026-11-11T00:00:00.000Z"),
    });

    const sheet = await readSheet(
      await createMoneyMovementsExport(user.id, {}),
    );

    expect(sheet.getRow(1).values).toEqual([
      undefined,
      "title",
      "category",
      "account",
      "amount",
      "type",
      "date",
    ]);

    expect(sheet.getRow(2).getCell(1).value).toBe("Lunch");
    expect(sheet.getRow(2).getCell(2).value).toBe("Food");
    expect(sheet.getRow(2).getCell(3).value).toBe("Cash");
    expect(sheet.getRow(2).getCell(4).value).toBe(12.34);
    expect(sheet.getRow(2).getCell(5).value).toBe("expense");
    expect(cellDate(sheet.getRow(2).getCell(6).value)).toBe("2026-11-10");

    expect(sheet.getRow(3).getCell(1).value).toBe("Salary");
    expect(sheet.getRow(3).getCell(2).value).toBe("");
    expect(sheet.getRow(3).getCell(5).value).toBe("income");

    expect(sheet.getRow(5).getCell(1).value).toBe("Total money moved");
    expect(sheet.getRow(5).getCell(4).value).toBe(112.34);
    expect(sheet.getRow(6).getCell(1).value).toBe("Total expense");
    expect(sheet.getRow(6).getCell(4).value).toBe(12.34);
    expect(sheet.getRow(7).getCell(1).value).toBe("Total income");
    expect(sheet.getRow(7).getCell(4).value).toBe(100);
  });

  it("limits rows and totals to the requested date range", async () => {
    const { user } = await setup();
    for (const [title, date, amount] of [
      ["Before", "2026-11-09", "1.00"],
      ["Inside", "2026-11-11", "2.00"],
      ["After", "2026-11-20", "3.00"],
    ] as const) {
      await createMovement(user.id, {
        title,
        amount,
        logged_for: new Date(`${date}T00:00:00.000Z`),
      });
    }

    const sheet = await readSheet(
      await createMoneyMovementsExport(user.id, {
        from: "2026-11-10",
        to: "2026-11-12",
      }),
    );

    expect(sheet.getRow(2).getCell(1).value).toBe("Inside");
    expect(sheet.getRow(3).getCell(1).value).toBeNull();
    expect(sheet.getRow(4).getCell(1).value).toBe("Total money moved");
    expect(sheet.getRow(4).getCell(4).value).toBe(2);
  });

  it("renders transfers as source to destination", async () => {
    const { user, cash, savings } = await setup();
    await createTransferMovement(user.id, cash.id, savings.id, "50.00");

    const sheet = await readSheet(
      await createMoneyMovementsExport(user.id, {}),
    );

    expect(sheet.getRow(2).getCell(1).value).toBe("Transfer");
    expect(sheet.getRow(2).getCell(3).value).toBe("Cash → Savings");
    expect(sheet.getRow(2).getCell(5).value).toBe("transfer");
  });

  it("does not export another user's movements", async () => {
    const { user } = await setup();
    const other = await createUser();
    await createMovement(other.id, { title: "Private" });
    await createMovement(user.id, { title: "Own" });

    const sheet = await readSheet(
      await createMoneyMovementsExport(user.id, {}),
    );

    expect(sheet.getRow(2).getCell(1).value).toBe("Own");
    expect(sheet.getRow(3).getCell(1).value).toBeNull();
  });

  it("exports headers and zero totals for an empty history", async () => {
    const { user } = await setup();

    const sheet = await readSheet(
      await createMoneyMovementsExport(user.id, {}),
    );

    expect(sheet.getRow(1).getCell(1).value).toBe("title");
    expect(sheet.getRow(3).getCell(1).value).toBe("Total money moved");
    expect(sheet.getRow(3).getCell(4).value).toBe(0);
  });

  it("rejects invalid user ids", async () => {
    await expectAppErrorAsync(createMoneyMovementsExport(null, {}), {
      status: 401,
    });
  });
});
