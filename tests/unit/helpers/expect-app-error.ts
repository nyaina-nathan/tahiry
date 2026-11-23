import { expect } from "vitest";
import { AppError } from "@/libs/errors/app-error";

type ExpectedAppError = {
  message?: string;
  status?: number;
  title?: string;
  origin?: string;
};

function assertAppError(caught: unknown, expected: ExpectedAppError): void {
  expect(caught).toBeInstanceOf(AppError);

  const appError = caught as AppError;

  if (expected.message !== undefined) {
    expect(appError.message).toBe(expected.message);
  }
  if (expected.status !== undefined) {
    expect(appError.status).toBe(expected.status);
  }
  if (expected.title !== undefined) {
    expect(appError.title).toBe(expected.title);
  }
  if (expected.origin !== undefined) {
    expect(appError.origin).toBe(expected.origin);
  }
}

export function expectAppError(
  fn: () => unknown,
  expected: ExpectedAppError,
): void {
  let caught: unknown;

  try {
    fn();
  } catch (error) {
    caught = error;
  }

  assertAppError(caught, expected);
}

export async function expectAppErrorAsync(
  promise: Promise<unknown>,
  expected: ExpectedAppError,
): Promise<void> {
  let caught: unknown;

  try {
    await promise;
  } catch (error) {
    caught = error;
  }

  assertAppError(caught, expected);
}
