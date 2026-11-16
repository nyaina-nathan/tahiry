import { AppError } from "@/libs/errors/app-error";
import type { AccountInput, AccountPatch } from "@/types/account.types";

function validationError(message: string): AppError {
  return new AppError("Bad Request", message, 400, "validation");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateAccountName(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : undefined;

  if (!name || name.length > 50) {
    throw validationError("Account name must be between 1 and 50 characters.");
  }

  return name;
}

export function validateAccountInput(payload: unknown): AccountInput {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  return {
    name: validateAccountName(payload.name),
  };
}

export function validateAccountPatch(payload: unknown): AccountPatch {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  if (!("name" in payload)) {
    throw validationError("At least one account field must be provided.");
  }

  return {
    name: validateAccountName(payload.name),
  };
}
