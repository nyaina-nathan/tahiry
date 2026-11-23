import { AppError } from "@/libs/errors/app-error";
import { hashPasswordResetToken } from "@/services/password-reset.core";

export type PasswordResetTokenRecord = {
  id: string;
  userId: string;
};

export type PasswordResetChangeDependencies = {
  findValidToken(
    tokenHash: string,
    now: string,
  ): Promise<PasswordResetTokenRecord | null>;
  hashPassword(password: string): Promise<string>;
  consumeTokenAndUpdatePassword(
    token: PasswordResetTokenRecord,
    tokenHash: string,
    passwordHash: string,
    now: string,
  ): Promise<boolean>;
  now(): number;
};

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function invalidPasswordResetTokenError(): AppError {
  return new AppError(
    "Bad Request",
    "The password reset token is invalid, expired, or has already been used.",
    400,
    "authentication",
  );
}

export async function changePassword(
  token: string,
  newPassword: string,
  dependencies: PasswordResetChangeDependencies,
): Promise<void> {
  if (!TOKEN_PATTERN.test(token)) {
    throw invalidPasswordResetTokenError();
  }

  const tokenHash = hashPasswordResetToken(token);
  const tokenRecord = await dependencies.findValidToken(
    tokenHash,
    new Date(dependencies.now()).toISOString(),
  );

  if (!tokenRecord) {
    throw invalidPasswordResetTokenError();
  }

  const passwordHash = await dependencies.hashPassword(newPassword);
  const consumed = await dependencies.consumeTokenAndUpdatePassword(
    tokenRecord,
    tokenHash,
    passwordHash,
    new Date(dependencies.now()).toISOString(),
  );

  if (!consumed) {
    throw invalidPasswordResetTokenError();
  }
}
