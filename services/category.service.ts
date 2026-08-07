import { prisma } from "@/libs/db/prisma";
import { AppError } from "@/libs/errors/app-error";
import type {
  Category,
  CategoryInput,
  CategoryPatch,
  CategoryType,
} from "@/types/category.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const categorySelect = {
  id: true,
  id_user: true,
  cat_type: true,
  cat_name: true,
} as const;

function unauthorizedError(): AppError {
  return new AppError(
    "Unauthorized",
    "Authentication is missing or invalid.",
    401,
    "authentication",
  );
}

function notFoundError(): AppError {
  return new AppError(
    "Not Found",
    "Category not found.",
    404,
    "category",
  );
}

function requireUserId(userId: string | null): string {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw unauthorizedError();
  }

  return userId;
}

function requireCategoryId(categoryId: string): string {
  if (!UUID_PATTERN.test(categoryId)) {
    throw notFoundError();
  }

  return categoryId;
}

function toCategory(category: {
  id: string;
  id_user: string;
  cat_type: string;
  cat_name: string;
}): Category {
  return {
    ...category,
    cat_type: category.cat_type as CategoryType,
  };
}

export async function listCategories(
  userIdHeader: string | null,
  categoryType?: CategoryType,
): Promise<Category[]> {
  const userId = requireUserId(userIdHeader);
  const categories = await prisma.categories.findMany({
    where: {
      id_user: userId,
      ...(categoryType === undefined ? {} : { cat_type: categoryType }),
    },
    orderBy: [{ cat_name: "asc" }, { id: "asc" }],
    select: categorySelect,
  });

  return categories.map(toCategory);
}

export async function createCategory(
  userIdHeader: string | null,
  payload: CategoryInput,
): Promise<Category> {
  const userId = requireUserId(userIdHeader);
  const category = await prisma.categories.create({
    data: {
      id_user: userId,
      cat_name: payload.cat_name,
      ...(payload.cat_type === undefined ? {} : { cat_type: payload.cat_type }),
    },
    select: categorySelect,
  });

  return toCategory(category);
}

export async function getCategory(
  userIdHeader: string | null,
  categoryId: string,
): Promise<Category> {
  const userId = requireUserId(userIdHeader);
  const id = requireCategoryId(categoryId);
  const category = await prisma.categories.findFirst({
    where: { id, id_user: userId },
    select: categorySelect,
  });

  if (!category) {
    throw notFoundError();
  }

  return toCategory(category);
}

export async function updateCategory(
  userIdHeader: string | null,
  categoryId: string,
  payload: CategoryPatch,
): Promise<Category> {
  const userId = requireUserId(userIdHeader);
  const id = requireCategoryId(categoryId);
  const result = await prisma.categories.updateMany({
    where: { id, id_user: userId },
    data: payload,
  });

  if (result.count === 0) {
    throw notFoundError();
  }

  return getCategory(userId, id);
}

export async function deleteCategory(
  userIdHeader: string | null,
  categoryId: string,
): Promise<void> {
  const userId = requireUserId(userIdHeader);
  const id = requireCategoryId(categoryId);
  const result = await prisma.categories.deleteMany({
    where: { id, id_user: userId },
  });

  if (result.count === 0) {
    throw notFoundError();
  }
}
