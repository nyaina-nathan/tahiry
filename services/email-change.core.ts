import { AppError } from "@/libs/errors/app-error";
import { createHash, randomBytes } from "node:crypto";

export type EmailChangePayload = {
  newEmail: string;
  currentPassword: string;
};

type EmailChangeUser = {
  id: string;
  email: string;
  passwordHash: string;
};

export type EmailChangeDependencies = {
  appUrl: string;
  findUser(userId: string): Promise<EmailChangeUser | null>;
  isEmailTaken(email: string): Promise<boolean>;
  verifyPassword(password: string, passwordHash: string): Promise<boolean>;
  savePendingChange(
    userId: string,
    pendingEmail: string,
    tokenHash: string,
    expiresAt: string,
  ): Promise<void>;
  clearPendingChange(userId: string, tokenHash: string): Promise<void>;
  sendConfirmationEmail(to: string, confirmationUrl: string): Promise<void>;
  createToken(): string;
  now(): number;
};

export type EmailChangeConfirmationResult =
  | { status: "invalid" }
  | { status: "expired" }
  | {
      status: "confirmed";
      previousEmail: string;
      newEmail: string;
    };

export type EmailChangeConfirmationDependencies = {
  applyChange(
    tokenHash: string,
    now: string,
  ): Promise<EmailChangeConfirmationResult>;
  sendChangedNotice(previousEmail: string, newEmail: string): Promise<void>;
  now(): number;
};

const TOKEN_TTL_MS = 10 * 60 * 1000;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalidEmailChangeTokenError(): AppError {
  return new AppError(
    "Bad Request",
    "The email change token is invalid, expired, or has already been used.",
    400,
    "authentication",
  );
}

export function createEmailChangeToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashEmailChangeToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestEmailChange(
  userId: string | null,
  payload: EmailChangePayload,
  dependencies: EmailChangeDependencies,
): Promise<void> {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw new AppError(
      "Unauthorized",
      "Authentication is missing or invalid.",
      401,
      "authentication",
    );
  }

  const user = await dependencies.findUser(userId);
  if (!user) {
    throw new AppError(
      "Unauthorized",
      "Authentication is missing or invalid.",
      401,
      "authentication",
    );
  }

  if (
    !(await dependencies.verifyPassword(
      payload.currentPassword,
      user.passwordHash,
    ))
  ) {
    throw new AppError(
      "Unauthorized",
      "Current password is incorrect.",
      401,
      "authentication",
    );
  }

  if (await dependencies.isEmailTaken(payload.newEmail)) {
    throw new AppError(
      "Conflict",
      "Email is already registered.",
      409,
      "authentication",
    );
  }

  const token = dependencies.createToken();
  const tokenHash = hashEmailChangeToken(token);
  const expiresAt = new Date(
    dependencies.now() + TOKEN_TTL_MS,
  ).toISOString();
  const confirmationUrl = new URL(
    "/api/auth/email-change/confirm",
    dependencies.appUrl,
  );
  confirmationUrl.searchParams.set("token", token);

  await dependencies.savePendingChange(
    userId,
    payload.newEmail,
    tokenHash,
    expiresAt,
  );

  try {
    await dependencies.sendConfirmationEmail(
      payload.newEmail,
      confirmationUrl.toString(),
    );
  } catch (error) {
    try {
      await dependencies.clearPendingChange(userId, tokenHash);
    } catch (cleanupError) {
      console.error("Failed to clear unsent email change request", {
        userId,
        cleanupError,
      });
    }

    throw error;
  }
}

export async function confirmEmailChange(
  token: string | null,
  dependencies: EmailChangeConfirmationDependencies,
): Promise<void> {
  if (!token || !TOKEN_PATTERN.test(token)) {
    throw invalidEmailChangeTokenError();
  }

  const result = await dependencies.applyChange(
    hashEmailChangeToken(token),
    new Date(dependencies.now()).toISOString(),
  );

  if (result.status === "invalid" || result.status === "expired") {
    throw invalidEmailChangeTokenError();
  }

  try {
    await dependencies.sendChangedNotice(
      result.previousEmail,
      result.newEmail,
    );
  } catch (error) {
    console.error("Email changed, but the old-address notification failed.", error);
  }
}
