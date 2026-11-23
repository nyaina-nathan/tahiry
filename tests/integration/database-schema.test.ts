import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase, prisma } from "./helpers/database";
import {
  createAccount,
  createCategory,
  createMovement,
  createUser,
} from "./helpers/fixtures";

beforeEach(resetDatabase);

describe("database schema", () => {
  it("creates every table the application expects", async () => {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;

    expect(rows.map((row) => row.table_name).sort()).toEqual([
      "account",
      "categories",
      "money_movements",
      "password_reset_token",
      "users",
      "weekly_reminder",
    ]);
  });

  it("accepts every movement type and rejects unknown ones", async () => {
    const user = await createUser();

    for (const movementType of ["EXPENSE", "INCOME", "TRANSFERT"]) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO money_movements (id_user, title, amount, movement_type)
         VALUES ($1, $2, 1.00, $3)`,
        user.id,
        movementType,
        movementType,
      );
    }

    await expect(
      prisma.$executeRawUnsafe(
        `INSERT INTO money_movements (id_user, title, amount, movement_type)
         VALUES ($1, 'Invalid', 1.00, 'INVALID')`,
        user.id,
      ),
    ).rejects.toThrow();
  });

  it("enforces one weekly reminder per user", async () => {
    const user = await createUser();

    await prisma.weekly_reminder.create({
      data: {
        id_user: user.id,
        day_of_week: 1,
        time: "1970-01-01T09:00:00Z",
      },
    });

    await expect(
      prisma.weekly_reminder.create({
        data: {
          id_user: user.id,
          day_of_week: 2,
          time: "1970-01-01T10:00:00Z",
        },
      }),
    ).rejects.toThrow();
  });

  it("enforces unique user emails", async () => {
    const user = await createUser();

    await expect(
      createUser({ email: user.email }),
    ).rejects.toThrow();
  });

  it("cascades user deletion through accounts, categories and movements", async () => {
    const user = await createUser();
    const account = await createAccount(user.id);
    const category = await createCategory(user.id);
    await createMovement(user.id, {
      id_account: account.id,
      id_category: category.id,
    });

    await prisma.users.delete({ where: { id: user.id } });

    await expect(
      prisma.account.count({ where: { id_user: user.id } }),
    ).resolves.toBe(0);
    await expect(
      prisma.categories.count({ where: { id_user: user.id } }),
    ).resolves.toBe(0);
    await expect(
      prisma.money_movements.count({ where: { id_user: user.id } }),
    ).resolves.toBe(0);
  });
});
