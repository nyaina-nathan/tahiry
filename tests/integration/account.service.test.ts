import { beforeEach, describe, expect, it } from "vitest";
import {
  createAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  updateAccount,
} from "@/services/account.service";
import { prisma, resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import {
  createAccount as createAccountFixture,
  createMovement,
  createTransferMovement,
  createUser,
} from "./helpers/fixtures";

beforeEach(resetDatabase);

describe("listAccounts", () => {
  it("returns only the user's accounts sorted by name", async () => {
    const user = await createUser();
    const other = await createUser();
    await createAccountFixture(user.id, "Savings");
    await createAccountFixture(user.id, "Cash");
    await createAccountFixture(other.id, "Other");

    const accounts = await listAccounts(user.id);

    expect(accounts.map((account) => account.name)).toEqual(["Cash", "Savings"]);
    expect(accounts.every((account) => account.id_user === user.id)).toBe(true);
    expect(accounts[0].created_at).toEqual(expect.any(String));
  });

  it("rejects invalid user ids", async () => {
    await expectAppErrorAsync(listAccounts(null), {
      title: "Unauthorized",
      message: "Authentication is missing or invalid.",
      status: 401,
    });
    await expectAppErrorAsync(listAccounts("not-a-uuid"), { status: 401 });
  });
});

describe("createAccount", () => {
  it("creates an account for the user", async () => {
    const user = await createUser();

    const account = await createAccount(user.id, { name: "Savings" });

    expect(account).toMatchObject({ id_user: user.id, name: "Savings" });
    await expect(
      prisma.account.count({ where: { id_user: user.id } }),
    ).resolves.toBe(1);
  });

  it("rejects a name that already exists case-insensitively", async () => {
    const user = await createUser();
    await createAccount(user.id, { name: "Cash" });

    await expectAppErrorAsync(createAccount(user.id, { name: "cash" }), {
      title: "Conflict",
      message: "An account with the same name already exists.",
      status: 409,
      origin: "account",
    });
  });

  it("allows the same name for different users", async () => {
    const user = await createUser();
    const other = await createUser();

    await createAccount(user.id, { name: "Cash" });
    await expect(
      createAccount(other.id, { name: "Cash" }),
    ).resolves.toMatchObject({ name: "Cash" });
  });
});

describe("getAccount", () => {
  it("returns an owned account", async () => {
    const user = await createUser();
    const created = await createAccountFixture(user.id, "Savings");

    await expect(getAccount(user.id, created.id)).resolves.toMatchObject({
      id: created.id,
      name: "Savings",
    });
  });

  it("does not expose another user's account", async () => {
    const user = await createUser();
    const other = await createUser();
    const account = await createAccountFixture(other.id, "Private");

    await expectAppErrorAsync(getAccount(user.id, account.id), {
      title: "Not Found",
      message: "Account not found.",
      status: 404,
      origin: "account",
    });
  });

  it("rejects malformed account ids", async () => {
    const user = await createUser();

    await expectAppErrorAsync(getAccount(user.id, "not-a-uuid"), {
      status: 404,
    });
  });
});

describe("updateAccount", () => {
  it("renames an account", async () => {
    const user = await createUser();
    const account = await createAccountFixture(user.id, "Cash");

    await expect(
      updateAccount(user.id, account.id, { name: "Wallet" }),
    ).resolves.toMatchObject({ id: account.id, name: "Wallet" });
  });

  it("rejects a rename that collides with another account", async () => {
    const user = await createUser();
    const first = await createAccountFixture(user.id, "Cash");
    await createAccountFixture(user.id, "Savings");

    await expectAppErrorAsync(
      updateAccount(user.id, first.id, { name: "savings" }),
      { status: 409 },
    );
  });

  it("allows an account to keep its own name", async () => {
    const user = await createUser();
    const account = await createAccountFixture(user.id, "Cash");

    await expect(
      updateAccount(user.id, account.id, { name: "CASH" }),
    ).resolves.toMatchObject({ name: "CASH" });
  });

  it("does not update another user's account", async () => {
    const user = await createUser();
    const other = await createUser();
    const account = await createAccountFixture(other.id, "Private");

    await expectAppErrorAsync(
      updateAccount(user.id, account.id, { name: "Stolen" }),
      { status: 404 },
    );
  });
});

describe("deleteAccount", () => {
  it("deletes an account and detaches its movements", async () => {
    const user = await createUser();
    const keep = await createAccountFixture(user.id, "Cash");
    const remove = await createAccountFixture(user.id, "Savings");
    const expense = await createMovement(user.id, {
      id_account: remove.id,
    });
    const transfer = await createTransferMovement(user.id, remove.id, keep.id);

    await deleteAccount(user.id, remove.id);

    await expect(
      prisma.account.findUnique({ where: { id: remove.id } }),
    ).resolves.toBeNull();
    await expect(
      prisma.money_movements.findUnique({ where: { id: expense.id } }),
    ).resolves.toMatchObject({ id_account: null });
    await expect(
      prisma.money_movements.findUnique({ where: { id: transfer.id } }),
    ).resolves.toMatchObject({ id_account_source: null });
  });

  it("keeps at least one account", async () => {
    const user = await createUser();
    const account = await createAccountFixture(user.id, "Only");

    await expectAppErrorAsync(deleteAccount(user.id, account.id), {
      title: "Conflict",
      message: "You must keep at least one account.",
      status: 409,
      origin: "account",
    });
  });

  it("does not delete another user's account", async () => {
    const user = await createUser();
    const other = await createUser();
    const account = await createAccountFixture(other.id, "Private");

    await expectAppErrorAsync(deleteAccount(user.id, account.id), {
      status: 404,
    });
  });
});
