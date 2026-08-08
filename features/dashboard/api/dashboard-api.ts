import type { Category } from "@/types/category.types";
import type { Balance } from "@/types/balance.types";
import type {
  MovementInput,
  MovementPage,
} from "@/types/money-movement.types";
import type {
  CurrentUser,
  DashboardData,
  Filters,
} from "@/features/dashboard/types";

const PAGE_SIZE = 25;

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
    page_size: PAGE_SIZE.toString(),
  });

  if (filters.movementType !== "ALL") {
    params.set("movement_type", filters.movementType);
  }
  if (filters.categoryId) {
    params.set("id_category", filters.categoryId);
  }
  if (filters.loggedForFrom) {
    params.set("logged_for_from", filters.loggedForFrom);
  }
  if (filters.loggedForTo) {
    params.set("logged_for_to", filters.loggedForTo);
  }

  return params.toString();
}

export async function fetchDashboardData(filters: Filters): Promise<DashboardData> {
  const [currentUser, currentBalance, currentCategories, currentMovements] =
    await Promise.all([
      fetchJson<CurrentUser>(
        "/api/auth/me",
        "Your session could not be loaded.",
      ),
      fetchJson<Balance>("/api/balance", "Balance could not be loaded."),
      fetchJson<Category[]>(
        "/api/categories",
        "Categories could not be loaded.",
      ),
      fetchJson<MovementPage>(
        `/api/money-movements?${buildMovementQuery(filters)}`,
        "Money movements could not be loaded.",
      ),
    ]);

  return {
    currentUser,
    currentBalance,
    currentCategories,
    currentMovements,
  };
}

export async function fetchBalanceAndMovements(filters: Filters) {
  const [currentBalance, currentMovements] = await Promise.all([
    fetchJson<Balance>("/api/balance", "Balance could not be loaded."),
    fetchJson<MovementPage>(
      `/api/money-movements?${buildMovementQuery(filters)}`,
      "Money movements could not be loaded.",
    ),
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
