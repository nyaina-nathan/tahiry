import type { Category } from "@/types/category.types";
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
  currentMovements: MovementPage;
};

const CASHFLOW_DAYS = 7;
const CASHFLOW_PAGE_SIZE = 100;
const CASHFLOW_MAX_PAGES = 10;

function buildCashflowDates(days: number): string[] {
  const now = new Date();
  const end = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return Array.from({ length: days }, (_, index) =>
    new Date(end - (days - 1 - index) * 86_400_000).toISOString().slice(0, 10),
  );
}

async function fetchCashflowMovements(from: string, to: string) {
  const movements: MoneyMovement[] = [];

  for (let page = 1; page <= CASHFLOW_MAX_PAGES; page += 1) {
    const query = new URLSearchParams({
      logged_for_from: from,
      logged_for_to: to,
      page: page.toString(),
      page_size: CASHFLOW_PAGE_SIZE.toString(),
    });
    const result = await fetchJson<MovementPage>(
      `/api/money-movements?${query.toString()}`,
      "The last 7 days could not be loaded.",
    );

    movements.push(...result.items);

    if (movements.length >= result.total || result.items.length === 0) {
      break;
    }
  }

  return movements;
}

export async function fetchCashflowWindow(): Promise<CashflowPoint[]> {
  const dates = buildCashflowDates(CASHFLOW_DAYS);
  const movements = await fetchCashflowMovements(
    dates[0],
    dates[dates.length - 1],
  );
  const points = new Map<string, CashflowPoint>(
    dates.map((date) => [date, { date, income: 0, expense: 0 }]),
  );

  for (const movement of movements) {
    const point = movement.logged_for
      ? points.get(movement.logged_for)
      : undefined;
    const amount = Number(movement.amount);

    if (!point || !Number.isFinite(amount)) {
      continue;
    }

    if (movement.movement_type === "INCOME") {
      point.income += amount;
    } else {
      point.expense += amount;
    }
  }

  return dates.map((date) => points.get(date)!);
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
  const [currentUser, currentBalance, currentCategories, currentMovements] =
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
      fetchMovementPage(filters),
    ]);

  return {
    currentUser,
    currentBalance,
    currentCategories,
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
