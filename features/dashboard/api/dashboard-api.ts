import type { Category } from "@/types/category.types";
import type { Account } from "@/types/account.types";
import type { Balance } from "@/types/balance.types";
import type {
  MoneyMovement,
  MovementInput,
  MovementPage,
} from "@/types/money-movement.types";
import type {
  CashflowPoint,
  CurrentUser,
  Filters,
} from "@/features/dashboard/types";
import {
  aggregateDailyTotals,
  buildDateRange,
  resolveMovementRange,
  type DailyTotalPoint,
} from "@/features/dashboard/utils/date-range";
import { fetchAccounts } from "@/features/accounts/api/accounts-api";

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

async function fetchJson<T>(url: string, fallback: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback));
  }

  return (await response.json()) as T;
}

export function buildMovementQuery(filters: Filters) {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    page_size: filters.pageSize.toString(),
  });

  if (filters.movementType !== "ALL") {
    params.set("movement_type", filters.movementType);
  }
  if (filters.categoryId) {
    params.set("id_category", filters.categoryId);
  }
  if (filters.accountId) {
    params.set("id_account", filters.accountId);
  }
  if (filters.loggedForFrom) {
    params.set("logged_for_from", filters.loggedForFrom);
  }
  if (filters.loggedForTo) {
    params.set("logged_for_to", filters.loggedForTo);
  }

  return params.toString();
}

export type WorkspaceSnapshot = {
  currentUser: CurrentUser;
  currentBalance: Balance | null;
  currentCategories: Category[];
  currentAccounts: Account[];
  currentMovements: MovementPage;
};

const CASHFLOW_PAGE_SIZE = 100;
const CASHFLOW_MAX_PAGES = 10;
const SERIES_MAX_PAGES = 25;

type RangeFetchOptions = {
  from: string;
  to: string;
  movementType: "INCOME" | "EXPENSE";
  categoryId?: string;
  accountId?: string;
  maxPages: number;
  errorMessage: string;
};

async function fetchMovementsInRange({
  from,
  to,
  movementType,
  categoryId,
  accountId,
  maxPages,
  errorMessage,
}: RangeFetchOptions) {
  const movements: MoneyMovement[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const query = new URLSearchParams({
      logged_for_from: from,
      logged_for_to: to,
      movement_type: movementType,
      page: page.toString(),
      page_size: CASHFLOW_PAGE_SIZE.toString(),
    });

    if (categoryId) {
      query.set("id_category", categoryId);
    }
    if (accountId) {
      query.set("id_account", accountId);
    }

    const result = await fetchJson<MovementPage>(
      `/api/money-movements?${query.toString()}`,
      errorMessage,
    );

    movements.push(...result.items);

    if (movements.length >= result.total || result.items.length === 0) {
      break;
    }
  }

  return movements;
}

export async function fetchCashflowWindow(): Promise<CashflowPoint[]> {
  const range = resolveMovementRange("", "");

  if (!range) {
    return [];
  }

  const dates = buildDateRange(range.from, range.to);
  const [incomeMovements, expenseMovements] = await Promise.all([
    fetchMovementsInRange({
      from: range.from,
      to: range.to,
      movementType: "INCOME",
      maxPages: CASHFLOW_MAX_PAGES,
      errorMessage: "The last 7 days could not be loaded.",
    }),
    fetchMovementsInRange({
      from: range.from,
      to: range.to,
      movementType: "EXPENSE",
      maxPages: CASHFLOW_MAX_PAGES,
      errorMessage: "The last 7 days could not be loaded.",
    }),
  ]);
  const incomePoints = aggregateDailyTotals(dates, incomeMovements);
  const expensePoints = aggregateDailyTotals(dates, expenseMovements);

  return dates.map((date, index) => ({
    date,
    income: incomePoints[index].total,
    expense: expensePoints[index].total,
  }));
}

type MovementDailyTotalsOptions = {
  from: string;
  to: string;
  movementType: "INCOME" | "EXPENSE";
  categoryId?: string;
  accountId?: string;
};

export async function fetchMovementDailyTotals({
  from,
  to,
  movementType,
  categoryId,
  accountId,
}: MovementDailyTotalsOptions): Promise<DailyTotalPoint[]> {
  const dates = buildDateRange(from, to);

  if (dates.length === 0) {
    return [];
  }

  const movements = await fetchMovementsInRange({
    from,
    to,
    movementType,
    categoryId,
    accountId,
    maxPages: SERIES_MAX_PAGES,
    errorMessage: "The chart could not be loaded.",
  });

  return aggregateDailyTotals(dates, movements);
}

function fetchBalance(includeBalance: boolean) {
  return includeBalance
    ? fetchJson<Balance>("/api/balance", "Balance could not be loaded.")
    : Promise.resolve(null);
}

function fetchMovementPage(filters: Filters) {
  return fetchJson<MovementPage>(
    `/api/money-movements?${buildMovementQuery(filters)}`,
    "Money movements could not be loaded.",
  );
}

export async function fetchWorkspaceData(
  filters: Filters,
  includeBalance: boolean,
): Promise<WorkspaceSnapshot> {
  const [currentUser, currentBalance, currentCategories, currentAccounts, currentMovements] =
    await Promise.all([
      fetchJson<CurrentUser>(
        "/api/auth/me",
        "Your session could not be loaded.",
      ),
      fetchBalance(includeBalance),
      fetchJson<Category[]>(
        "/api/categories",
        "Categories could not be loaded.",
      ),
      fetchAccounts(),
      fetchMovementPage(filters),
    ]);

  return {
    currentUser,
    currentBalance,
    currentCategories,
    currentAccounts,
    currentMovements,
  };
}

export async function fetchWorkspaceUpdates(
  filters: Filters,
  includeBalance: boolean,
) {
  const [currentBalance, currentMovements] = await Promise.all([
    fetchBalance(includeBalance),
    fetchMovementPage(filters),
  ]);

  return { currentBalance, currentMovements };
}

export async function saveMoneyMovement(
  id: string | null,
  payload: MovementInput,
) {
  const response = await fetch(
    id ? `/api/money-movements/${id}` : "/api/money-movements",
    {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        id
          ? "Money movement could not be updated."
          : "Money movement could not be created.",
      ),
    );
  }
}

export async function deleteMoneyMovement(id: string) {
  const response = await fetch(`/api/money-movements/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Money movement could not be deleted."),
    );
  }
}
