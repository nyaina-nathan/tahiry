import { beforeEach, describe, expect, it } from "vitest";
import { getBalance } from "@/services/balance.service";
import { resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import {
  createAccount,
  createMovement,
  createTransferMovement,
  createUser,
} from "./helpers/fixtures";

beforeEach(resetDatabase);

describe("getBalance", () => {
  it("returns zeroes when the user has no accounts or movements", async () => {
    const user = await createUser();

    await expect(getBalance(user.id)).resolves.toEqual({
      income: "0.00",
      expense: "0.00",
      balance: "0.00",
      accounts: [],
    });
  });

  it("derives per-account and global balances from movements", async () => {
    const user = await createUser();
    const cash = await createAccount(user.id, "Cash");
    const savings = await createAccount(user.id, "Savings");

    await createMovement(user.id, {
      movement_type: "INCOME",
      id_account: cash.id,
      amount: "100.10",
    });
    await createMovement(user.id, {
      movement_type: "EXPENSE",
      id_account: cash.id,
      amount: "30.05",
    });
    await createTransferMovement(user.id, cash.id, savings.id, "20.00");
    await createMovement(user.id, {
      movement_type: "INCOME",
      id_account: null,
      amount: "5.55",
    });
    await createMovement(user.id, {
      movement_type: "EXPENSE",
      id_account: null,
      amount: "1.11",
    });

    const balance = await getBalance(user.id);

    expect(balance).toEqual({
      income: "105.65",
      expense: "31.16",
      balance: "74.49",
      accounts: [
        {
          id_account: cash.id,
          name: "Cash",
          income: "100.10",
          expense: "30.05",
          balance: "50.05",
        },
        {
          id_account: savings.id,
          name: "Savings",
          income: "0.00",
          expense: "0.00",
          balance: "20.00",
        },
      ],
    });
  });

  it("keeps decimal sums exact", async () => {
    const user = await createUser();
    const account = await createAccount(user.id, "Cash");

    await createMovement(user.id, {
      movement_type: "INCOME",
      id_account: account.id,
      amount: "0.10",
    });
    await createMovement(user.id, {
      movement_type: "INCOME",
      id_account: account.id,
      amount: "0.20",
    });

    const balance = await getBalance(user.id);

    expect(balance.balance).toBe("0.30");
    expect(balance.accounts[0].balance).toBe("0.30");
  });

  it("sorts accounts by name", async () => {
    const user = await createUser();
    await createAccount(user.id, "Savings");
    await createAccount(user.id, "Cash");

    const balance = await getBalance(user.id);

    expect(balance.accounts.map((account) => account.name)).toEqual([
      "Cash",
      "Savings",
    ]);
  });

  it("rejects invalid user ids", async () => {
    await expectAppErrorAsync(getBalance(null), {
      title: "Unauthorized",
      message: "Authentication is missing or invalid.",
      status: 401,
    });
  });
});
