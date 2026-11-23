import { beforeEach, describe, expect, it } from "vitest";
import {
  createMoneyMovement,
  deleteMoneyMovement,
  getMoneyMovement,
  listMoneyMovements,
  updateMoneyMovement,
} from "@/services/money-movement.service";
import { resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import {
  createAccount,
  createCategory,
  createMovement,
  createUser,
} from "./helpers/fixtures";

beforeEach(resetDatabase);

async function setup() {
  const user = await createUser();
  const account = await createAccount(user.id, "Cash");
  const category = await createCategory(user.id, "Food");
  const other = await createUser();
  const otherAccount = await createAccount(other.id, "Other");

  return { user, account, category, other, otherAccount };
}

const baseFilters = { page: 1, pageSize: 25 };

describe("createMoneyMovement", () => {
  it("creates an expense with its relations and timestamps", async () => {
    const { user, account, category } = await setup();

    const movement = await createMoneyMovement(user.id, {
      movement_type: "EXPENSE",
      id_category: category.id,
      id_account: account.id,
      title: "Lunch",
      description: "Cafe",
      amount: "42.50",
      logged_for: "2026-11-18",
      logged_at: "2026-11-18T12:30:00.000Z",
    });

    expect(movement).toMatchObject({
      id_user: user.id,
      id_category: category.id,
      id_account: account.id,
      movement_type: "EXPENSE",
      title: "Lunch",
      description: "Cafe",
      amount: "42.50",
      logged_for: "2026-11-18",
      logged_at: "2026-11-18T12:30:00.000Z",
    });
  });

  it("uses the database defaults for omitted columns", async () => {
    const { user } = await setup();

    const movement = await createMoneyMovement(user.id, {
      title: "Adjustment",
      amount: "5.00",
    });

    expect(movement.movement_type).toBe("EXPENSE");
    expect(movement.id_category).toBeNull();
    expect(movement.id_account).toBeNull();
    expect(movement.logged_for).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(movement.logged_at).toEqual(expect.any(String));
  });

  it("rejects a category or account owned by another user", async () => {
    const { user, category, other, otherAccount } = await setup();
    const foreignCategory = await createCategory(other.id, "Private");

    await expectAppErrorAsync(
      createMoneyMovement(user.id, {
        title: "Lunch",
        amount: "10.00",
        id_category: foreignCategory.id,
      }),
      { status: 404, message: "Category not found." },
    );

    await expectAppErrorAsync(
      createMoneyMovement(user.id, {
        title: "Lunch",
        amount: "10.00",
        id_category: category.id,
        id_account: otherAccount.id,
      }),
      { status: 404, message: "Account not found." },
    );

    expect(other.id).not.toBe(user.id);
  });
});

describe("getMoneyMovement", () => {
  it("returns an owned movement", async () => {
    const { user, account } = await setup();
    const created = await createMovement(user.id, { id_account: account.id });

    await expect(getMoneyMovement(user.id, created.id)).resolves.toMatchObject({
      id: created.id,
      amount: "10.00",
    });
  });

  it("hides another user's movement", async () => {
    const { user, other } = await setup();
    const created = await createMovement(other.id);

    await expectAppErrorAsync(getMoneyMovement(user.id, created.id), {
      title: "Not Found",
      message: "Money movement not found.",
      status: 404,
      origin: "money-movement",
    });
  });

  it("rejects malformed movement ids", async () => {
    const { user } = await setup();

    await expectAppErrorAsync(getMoneyMovement(user.id, "not-a-uuid"), {
      status: 404,
    });
  });
});

describe("updateMoneyMovement", () => {
  it("updates the fields that are provided", async () => {
    const { user, category } = await setup();
    const created = await createMovement(user.id);

    const updated = await updateMoneyMovement(user.id, created.id, {
      title: "Renamed",
      amount: "20.50",
      id_category: category.id,
    });

    expect(updated).toMatchObject({
      id: created.id,
      title: "Renamed",
      amount: "20.50",
      id_category: category.id,
    });
  });

  it("clears nullable fields", async () => {
    const { user, category } = await setup();
    const created = await createMovement(user.id, { id_category: category.id });

    await expect(
      updateMoneyMovement(user.id, created.id, { id_category: null }),
    ).resolves.toMatchObject({ id_category: null });
  });

  it("rejects a category owned by another user", async () => {
    const { user, other } = await setup();
    const created = await createMovement(user.id);
    const foreignCategory = await createCategory(other.id, "Private");

    await expectAppErrorAsync(
      updateMoneyMovement(user.id, created.id, {
        id_category: foreignCategory.id,
      }),
      { status: 404 },
    );
  });

  it("does not update another user's movement", async () => {
    const { user, other } = await setup();
    const created = await createMovement(other.id);

    await expectAppErrorAsync(
      updateMoneyMovement(user.id, created.id, { title: "Stolen" }),
      { status: 404 },
    );
  });
});

describe("deleteMoneyMovement", () => {
  it("deletes an owned movement", async () => {
    const { user } = await setup();
    const created = await createMovement(user.id);

    await expect(
      deleteMoneyMovement(user.id, created.id),
    ).resolves.toBeUndefined();
    await expectAppErrorAsync(getMoneyMovement(user.id, created.id), {
      status: 404,
    });
  });

  it("does not delete another user's movement", async () => {
    const { user, other } = await setup();
    const created = await createMovement(other.id);

    await expectAppErrorAsync(deleteMoneyMovement(user.id, created.id), {
      status: 404,
    });
  });
});

describe("listMoneyMovements", () => {
  async function seed() {
    const { user, account, category, other } = await setup();
    const savings = await createAccount(user.id, "Savings");
    const otherAccount = await createAccount(other.id, "Other");

    const income = await createMovement(user.id, {
      movement_type: "INCOME",
      id_account: account.id,
      title: "Salary",
      amount: "1000.00",
      logged_for: new Date("2026-11-10T00:00:00.000Z"),
    });
    const expense = await createMovement(user.id, {
      movement_type: "EXPENSE",
      id_account: account.id,
      id_category: category.id,
      title: "Lunch",
      amount: "12.50",
      logged_for: new Date("2026-11-12T00:00:00.000Z"),
    });
    const transfer = await createMovement(user.id, {
      movement_type: "TRANSFERT",
      id_account: savings.id,
      id_account_source: account.id,
      title: "Transfer",
      amount: "50.00",
      logged_for: new Date("2026-11-14T00:00:00.000Z"),
    });
    await createMovement(user.id, {
      movement_type: "EXPENSE",
      title: "Unassigned",
      amount: "5.00",
      logged_for: new Date("2026-11-16T00:00:00.000Z"),
    });
    await createMovement(other.id, {
      id_account: otherAccount.id,
      title: "Private",
      logged_for: new Date("2026-11-15T00:00:00.000Z"),
    });

    return { user, account, savings, category, income, expense, transfer };
  }

  it("returns a paginated page ordered by date descending", async () => {
    const { user } = await seed();

    const page = await listMoneyMovements(user.id, baseFilters);

    expect(page.total).toBe(4);
    expect(page.page).toBe(1);
    expect(page.page_size).toBe(25);
    expect(page.items.map((item) => item.logged_for)).toEqual([
      "2026-11-16",
      "2026-11-14",
      "2026-11-12",
      "2026-11-10",
    ]);
  });

  it("filters by movement type", async () => {
    const { user } = await seed();

    const page = await listMoneyMovements(user.id, {
      ...baseFilters,
      movementType: "EXPENSE",
    });

    expect(page.total).toBe(2);
    expect(page.items.map((item) => item.title)).toEqual([
      "Unassigned",
      "Lunch",
    ]);
  });

  it("filters by category", async () => {
    const { user, category } = await seed();

    const page = await listMoneyMovements(user.id, {
      ...baseFilters,
      categoryId: category.id,
    });

    expect(page.total).toBe(1);
    expect(page.items[0].title).toBe("Lunch");
  });

  it("filters by account on both sides of a transfer", async () => {
    const { user, account } = await seed();

    const page = await listMoneyMovements(user.id, {
      ...baseFilters,
      accountId: account.id,
    });

    expect(page.total).toBe(3);
    expect(page.items.map((item) => item.title)).toEqual([
      "Transfer",
      "Lunch",
      "Salary",
    ]);
  });

  it("filters by an inclusive date range", async () => {
    const { user } = await seed();

    const page = await listMoneyMovements(user.id, {
      ...baseFilters,
      loggedForFrom: "2026-11-12",
      loggedForTo: "2026-11-14",
    });

    expect(page.total).toBe(2);
    expect(page.items.map((item) => item.title)).toEqual([
      "Transfer",
      "Lunch",
    ]);
  });

  it("paginates without losing the total count", async () => {
    const { user } = await seed();

    const first = await listMoneyMovements(user.id, {
      page: 1,
      pageSize: 2,
    });
    const second = await listMoneyMovements(user.id, {
      page: 2,
      pageSize: 2,
    });
    const third = await listMoneyMovements(user.id, {
      page: 3,
      pageSize: 2,
    });

    expect(first.items).toHaveLength(2);
    expect(second.items).toHaveLength(2);
    expect(third.items).toHaveLength(0);
    expect(first.total).toBe(4);
    expect(second.total).toBe(4);
  });

  it("orders movements logged on the same day by logged_at descending", async () => {
    const { user } = await setup();
    const date = new Date("2026-11-17T00:00:00.000Z");
    await createMovement(user.id, {
      title: "Morning",
      logged_for: date,
      logged_at: new Date("2026-11-17T08:00:00.000Z"),
    });
    await createMovement(user.id, {
      title: "Evening",
      logged_for: date,
      logged_at: new Date("2026-11-17T20:00:00.000Z"),
    });

    const page = await listMoneyMovements(user.id, baseFilters);

    expect(page.items.map((item) => item.title)).toEqual([
      "Evening",
      "Morning",
    ]);
  });

  it("rejects invalid user ids", async () => {
    await expectAppErrorAsync(listMoneyMovements(null, baseFilters), {
      status: 401,
    });
  });
});
