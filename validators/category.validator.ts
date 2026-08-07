import { AppError } from "@/libs/errors/app-error";
import type {
  CategoryInput,
  CategoryPatch,
  CategoryType,
} from "@/types/category.types";

function validationError(message: string): AppError {
  return new AppError("Bad Request", message, 400, "validation");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCategoryType(value: unknown): CategoryType {
  if (value !== "EXPENSE" && value !== "INCOME") {
    throw validationError("Category type must be EXPENSE or INCOME.");
  }

  return value;
}

export function parseCategoryTypeQuery(
  value: string | null,
): CategoryType | undefined {
  return value === null ? undefined : validateCategoryType(value);
}

function validateCategoryName(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : undefined;

  if (!name || name.length > 255) {
    throw validationError("Category name must be between 1 and 255 characters.");
  }

  return name;
}

export function validateCategoryInput(payload: unknown): CategoryInput {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const categoryType =
    payload.cat_type === undefined
      ? undefined
      : validateCategoryType(payload.cat_type);

  return {
    cat_name: validateCategoryName(payload.cat_name),
    ...(categoryType === undefined ? {} : { cat_type: categoryType }),
  };
}

export function validateCategoryPatch(payload: unknown): CategoryPatch {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const hasName = "cat_name" in payload;
  const hasType = "cat_type" in payload;

  if (!hasName && !hasType) {
    throw validationError("At least one category field must be provided.");
  }

  const categoryType = hasType
    ? validateCategoryType(payload.cat_type)
    : undefined;

  return {
    ...(hasName ? { cat_name: validateCategoryName(payload.cat_name) } : {}),
    ...(categoryType === undefined ? {} : { cat_type: categoryType }),
  };
}
