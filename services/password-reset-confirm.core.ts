// @ts-expect-error Node's native TypeScript runner requires the extension.
import { AppError } from "../libs/errors/app-error.ts";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { hashPasswordResetToken } from "./password-reset.core.ts";

export type PasswordResetConfirmDependencies = {
  findValidToken(tokenHash: string, now: string): Promise<boolean>;
  now(): number;
};

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function invalidPasswordResetTokenError(): AppError {
  return new AppError(
    "Bad Request",
    "The password reset link is invalid or expired. Request a new one to try again.",
    400,
    "authentication",
  );
}

export async function confirmPasswordResetToken(
  token: string | null,
  dependencies: PasswordResetConfirmDependencies,
): Promise<void> {
  if (!token || !TOKEN_PATTERN.test(token)) {
    throw invalidPasswordResetTokenError();
  }

  const isValid = await dependencies.findValidToken(
    hashPasswordResetToken(token),
    new Date(dependencies.now()).toISOString(),
  );

  if (!isValid) {
    throw invalidPasswordResetTokenError();
  }
}
