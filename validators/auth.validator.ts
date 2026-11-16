import { AppError } from "@/libs/errors/app-error";

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  currency: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

function validationError(message: string): AppError {
  return new AppError("Bad Request", message, 400, "validation");
}

export async function parseJsonPayload(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw validationError("Request body must contain valid JSON.");
  }
}

export async function parseOptionalJsonPayload(
  request: Request,
): Promise<unknown> {
  const body = await request.text();

  if (!body.trim()) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    throw validationError("Request body must contain valid JSON.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(
  payload: Record<string, unknown>,
  field: string,
): string | undefined {
  const value = payload[field];
  return typeof value === "string" ? value : undefined;
}

function validateEmail(email: string): string {
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw validationError("Email must be a valid email address.");
  }

  return email.toLowerCase();
}

export function validateRegisterPayload(payload: unknown): RegisterPayload {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const username = getString(payload, "username")?.trim();
  const email = getString(payload, "email")?.trim();
  const password = getString(payload, "password");
  const currency = getString(payload, "currency")?.trim();

  if (!username || username.length > 255) {
    throw validationError("Username must be between 1 and 255 characters.");
  }

  if (!email) {
    throw validationError("Email is required.");
  }

  if (password === undefined || password.length < 8 || password.length > 72) {
    throw validationError("Password must be between 8 and 72 characters.");
  }

  if (!currency || currency.length > 20) {
    throw validationError("Currency must be between 1 and 20 characters.");
  }

  return {
    username,
    email: validateEmail(email),
    password,
    currency,
  };
}

export function validateLoginPayload(payload: unknown): LoginPayload {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const email = getString(payload, "email")?.trim();
  const password = getString(payload, "password");

  if (!email) {
    throw validationError("Email is required.");
  }

  if (password === undefined) {
    throw validationError("Password is required.");
  }

  return {
    email: validateEmail(email),
    password,
  };
}
