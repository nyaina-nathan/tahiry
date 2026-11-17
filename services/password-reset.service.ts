import { Resend } from "resend";
import { prisma } from "@/libs/db/prisma";
import type { PasswordResetPayload } from "@/validators/auth.validator";
import {
  createPasswordResetToken,
  requestPasswordReset as requestPasswordResetCore,
  type PasswordResetDependencies,
} from "./password-reset.core";
import { buildPasswordResetEmail } from "./password-reset-email";

const PASSWORD_RESET_SUBJECT = "Reset your password";

function getAppUrl(): string {
  const configuredUrl =
    process.env.APP_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

  if (!configuredUrl) {
    throw new Error("APP_URL must be configured in production.");
  }

  const appUrl = new URL(configuredUrl);
  if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production.");
  }

  return appUrl.origin;
}

function createDependencies(): PasswordResetDependencies {
  return {
    appUrl: getAppUrl(),
    findUserByEmail: async (email) => {
      const user = await prisma.users.findUnique({
        where: { email },
        select: { id: true, email: true },
      });

      return user ? { id: user.id, email: user.email } : null;
    },
    saveToken: async (userId, tokenHash, expiresAt) => {
      await prisma.password_reset_token.create({
        data: {
          id_user: userId,
          token_hash: tokenHash,
          expires_at: new Date(expiresAt),
        },
      });
    },
    deleteToken: async (userId, tokenHash) => {
      await prisma.password_reset_token.deleteMany({
        where: { id_user: userId, token_hash: tokenHash },
      });
    },
    sendResetEmail: async (to, resetUrl) => {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM;

      if (!apiKey || !from) {
        throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured.");
      }

      const resend = new Resend(apiKey);
      const email = buildPasswordResetEmail(resetUrl);
      const result = await resend.emails.send({
        from,
        to,
        subject: PASSWORD_RESET_SUBJECT,
        html: email.html,
        text: email.text,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    },
    createToken: createPasswordResetToken,
    now: Date.now,
  };
}

export async function requestPasswordReset(
  payload: PasswordResetPayload,
): Promise<void> {
  await requestPasswordResetCore(payload.email, createDependencies());
}
