import { beforeEach, describe, expect, it } from "vitest";
import { getBalance } from "@/services/balance.service";
import { createTransfer } from "@/services/transfer.service";
import { resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import {
  createAccount,
  createMovement,
  createUser,
} from "./helpers/fixtures";

beforeEach(resetDatabase);

async function setup() {
  const user = await createUser();
  const cash = await createAccount(user.id, "Cash");
  const savings = await createAccount(user.id, "Savings");

  return { user, cash, savings };
}

async function fundAccount(userId: string, accountId: string, amount: string) {
  await createMovement(userId, {
    movement_type: "INCOME",
    id_account: accountId,
    amount,
  });
}

describe("createTransfer", () => {
  it("moves money between the user's accounts", async () => {
    const { user, cash, savings } = await setup();
    await fundAccount(user.id, cash.id, "100.00");

    const transfer = await createTransfer(user.id, {
      id_account_source: cash.id,
      id_account: savings.id,
      amount: "40.00",
    });

    expect(transfer).toMatchObject({
      movement_type: "TRANSFERT",
      id_account: savings.id,
      id_account_source: cash.id,
      amount: "40.00",
      title: "Transfer to Savings",
    });

    const balance = await getBalance(user.id);
    expect(
      balance.accounts.find((account) => account.id_account === cash.id)
        ?.balance,
    ).toBe("60.00");
    expect(
      balance.accounts.find((account) => account.id_account === savings.id)
        ?.balance,
    ).toBe("40.00");
  });

  it("accepts explicit metadata", async () => {
    const { user, cash, savings } = await setup();
    await fundAccount(user.id, cash.id, "100.00");

    await expect(
      createTransfer(user.id, {
        id_account_source: cash.id,
        id_account: savings.id,
        amount: "25.50",
        title: "Monthly savings",
        description: "November",
        logged_for: "2026-11-17",
        logged_at: "2026-11-17T12:00:00.000Z",
      }),
    ).resolves.toMatchObject({
      title: "Monthly savings",
      description: "November",
      logged_for: "2026-11-17",
      logged_at: "2026-11-17T12:00:00.000Z",
    });
  });

  it("rejects a transfer that exceeds the source balance", async () => {
    const { user, cash, savings } = await setup();
    await fundAccount(user.id, cash.id, "100.00");
    await createTransfer(user.id, {
      id_account_source: cash.id,
      id_account: savings.id,
      amount: "100.00",
    });

    await expectAppErrorAsync(
      createTransfer(user.id, {
        id_account_source: cash.id,
        id_account: savings.id,
        amount: "0.01",
      }),
      {
        title: "Conflict",
        message:
          "The source account does not have enough funds for this transfer.",
        status: 409,
        origin: "transfer",
      },
    );
  });

  it("rejects accounts that do not belong to the user", async () => {
    const { user, cash } = await setup();
    const other = await createUser();
    const foreign = await createAccount(other.id, "Foreign");
    await fundAccount(user.id, cash.id, "100.00");

    await expectAppErrorAsync(
      createTransfer(user.id, {
        id_account_source: cash.id,
        id_account: foreign.id,
        amount: "10.00",
      }),
      {
        title: "Not Found",
        message: "Account not found.",
        status: 404,
        origin: "account",
      },
    );
  });

  it("rejects a transfer whose source and destination are the same account", async () => {
    const { user, cash } = await setup();
    await fundAccount(user.id, cash.id, "100.00");

    await expectAppErrorAsync(
      createTransfer(user.id, {
        id_account_source: cash.id,
        id_account: cash.id,
        amount: "10.00",
      }),
      { status: 404 },
    );
  });

  it("rejects invalid user ids", async () => {
    const { cash, savings } = await setup();

    await expectAppErrorAsync(
      createTransfer(null, {
        id_account_source: cash.id,
        id_account: savings.id,
        amount: "10.00",
      }),
      { status: 401 },
    );
  });
});
