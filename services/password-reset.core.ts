import { createHash, randomBytes } from "node:crypto";

export type PasswordResetUser = {
  id: string;
  email: string;
};

export type PasswordResetDependencies = {
  appUrl: string;
  findUserByEmail(email: string): Promise<PasswordResetUser | null>;
  saveToken(userId: string, tokenHash: string, expiresAt: string): Promise<void>;
  deleteToken(userId: string, tokenHash: string): Promise<void>;
  sendResetEmail(to: string, resetUrl: string): Promise<void>;
  createToken(): string;
  now(): number;
};

const TOKEN_TTL_MS = 5 * 60 * 1000;

export function createPasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
  email: string,
  dependencies: PasswordResetDependencies,
): Promise<void> {
  const user = await dependencies.findUserByEmail(email);
  if (!user) {
    return;
  }

  const token = dependencies.createToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(
    dependencies.now() + TOKEN_TTL_MS,
  ).toISOString();
  const confirmationUrl = new URL(
    "/api/auth/password-reset/confirm",
    dependencies.appUrl,
  );
  confirmationUrl.searchParams.set("token", token);

  await dependencies.saveToken(user.id, tokenHash, expiresAt);

  try {
    await dependencies.sendResetEmail(user.email, confirmationUrl.toString());
  } catch (error) {
    try {
      await dependencies.deleteToken(user.id, tokenHash);
    } catch (cleanupError) {
      console.error("Failed to remove an unsent password reset token", {
        userId: user.id,
        cleanupError,
      });
    }

    throw error;
  }
}
