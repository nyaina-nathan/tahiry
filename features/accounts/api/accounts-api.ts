import type { Account } from "@/types/account.types";
import type { AccountInput } from "@/types/account.types";
import type { Balance } from "@/types/balance.types";
import type { CurrentUser } from "@/features/dashboard/types";
import type { MoneyMovement } from "@/types/money-movement.types";
import type { TransferInput } from "@/types/transfer.types";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

async function getErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error?.message ?? fallback;
}

export type AccountWithBalance = Account & {
  balance: string;
  income: string;
  expense: string;
};

export type AccountsWorkspace = {
  accounts: AccountWithBalance[];
  balance: Balance;
  currentUser: CurrentUser;
};

export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch("/api/accounts");

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Accounts could not be loaded."),
    );
  }

  return (await response.json()) as Account[];
}

export async function createAccount(payload: AccountInput) {
  const response = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Account could not be created."),
    );
  }

  return (await response.json()) as Account;
}

export async function createTransfer(
  payload: TransferInput,
): Promise<MoneyMovement> {
  const response = await fetch("/api/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Transfer could not be completed."),
    );
  }

  return (await response.json()) as MoneyMovement;
}

export async function fetchAccountsWorkspace(): Promise<AccountsWorkspace> {
  const [accounts, balance, currentUser] = await Promise.all([
    fetchAccounts(),
    (async () => {
      const response = await fetch("/api/balance");

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Balances could not be loaded."),
        );
      }

      return (await response.json()) as Balance;
    })(),
    (async () => {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Your session could not be loaded."),
        );
      }

      return (await response.json()) as CurrentUser;
    })(),
  ]);

  const balancesById = new Map(
    balance.accounts.map((entry) => [entry.id_account, entry]),
  );

  return {
    accounts: accounts.map((account) => {
      const entry = balancesById.get(account.id);

      return {
        ...account,
        balance: entry?.balance ?? "0.00",
        income: entry?.income ?? "0.00",
        expense: entry?.expense ?? "0.00",
      };
    }),
    balance,
    currentUser,
  };
}
