import type {
  Category,
  CategoryInput,
  CategoryPatch,
} from "@/types/category.types";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function sortCategories(categories: Category[]) {
  return [...categories].sort(
    (a, b) => a.cat_name.localeCompare(b.cat_name) || a.id.localeCompare(b.id),
  );
}

async function getErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error?.message ?? fallback;
}

export async function fetchCategories() {
  const response = await fetch("/api/categories");

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Categories could not be loaded."),
    );
  }

  return sortCategories((await response.json()) as Category[]);
}

export async function createCategory(payload: CategoryInput) {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Category could not be created."),
    );
  }

  return (await response.json()) as Category;
}

export async function updateCategory(id: string, payload: CategoryPatch) {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Category could not be updated."),
    );
  }

  return (await response.json()) as Category;
}

export async function deleteCategory(id: string) {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Category could not be deleted."),
    );
  }
}
