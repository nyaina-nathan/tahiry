import bcrypt from "bcrypt";
import { Resend } from "resend";
import { prisma } from "@/libs/db/prisma";
import {
  duplicateEmailError,
  isUniqueConstraintError,
} from "@/libs/errors/app-error";
import type { EmailChangePayload } from "@/validators/auth.validator";
import {
  confirmEmailChange as confirmEmailChangeCore,
  createEmailChangeToken,
  requestEmailChange as createEmailChangeRequest,
  type EmailChangeConfirmationDependencies,
  type EmailChangeDependencies,
} from "./email-change.core";
import {
  buildEmailChangeEmail,
  buildEmailChangedNotice,
} from "./email-change-email";

const EMAIL_CHANGE_SUBJECT = "Confirm your new email address";
const EMAIL_CHANGED_SUBJECT = "Your account email address was changed";
const clearEmailChangeFields = {
  pending_email: null,
  email_change_token_hash: null,
  email_change_expires_at: null,
};

function getAppUrl(): string {
  const configuredUrl =
    process.env.APP_URL ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

  if (!configuredUrl) {
    throw new Error("APP_URL must be configured in production.");
  }

  const appUrl = new URL(configuredUrl);
  if (
    process.env.NODE_ENV === "production" &&
    appUrl.protocol !== "https:"
  ) {
    throw new Error("APP_URL must use HTTPS in production.");
  }

  return appUrl.origin;
}

function createDependencies(): EmailChangeDependencies {
  return {
    appUrl: getAppUrl(),
    findUser: async (userId) => {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, email: true, password_hash: true },
      });

      return user
        ? {
            id: user.id,
            email: user.email,
            passwordHash: user.password_hash,
          }
        : null;
    },
    isEmailTaken: async (email) =>
      Boolean(
        await prisma.users.findUnique({
          where: { email },
          select: { id: true },
        }),
      ),
    verifyPassword: (password, passwordHash) =>
      bcrypt.compare(password, passwordHash),
    savePendingChange: async (userId, pendingEmail, tokenHash, expiresAt) => {
      await prisma.users.update({
        where: { id: userId },
        data: {
          pending_email: pendingEmail,
          email_change_token_hash: tokenHash,
          email_change_expires_at: expiresAt,
        },
      });
    },
    clearPendingChange: async (userId, tokenHash) => {
      await prisma.users.updateMany({
        where: {
          id: userId,
          email_change_token_hash: tokenHash,
        },
        data: {
          pending_email: null,
          email_change_token_hash: null,
          email_change_expires_at: null,
        },
      });
    },
    sendConfirmationEmail: async (to, confirmationUrl) => {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM;

      if (!apiKey || !from) {
        throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured.");
      }

      const resend = new Resend(apiKey);
      const email = buildEmailChangeEmail(confirmationUrl);
      const result = await resend.emails.send({
        from,
        to,
        subject: EMAIL_CHANGE_SUBJECT,
        html: email.html,
        text: email.text,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    },
    createToken: createEmailChangeToken,
    now: Date.now,
  };
}

function createConfirmationDependencies(): EmailChangeConfirmationDependencies {
  return {
    now: Date.now,
    applyChange: async (tokenHash, now) => {
      try {
        return await prisma.$transaction(async (transaction) => {
          const user = await transaction.users.findFirst({
            where: { email_change_token_hash: tokenHash },
            select: {
              id: true,
              email: true,
              pending_email: true,
              email_change_expires_at: true,
            },
          });

          if (!user) {
            return { status: "invalid" } as const;
          }

          const expiration = user.email_change_expires_at
            ? Date.parse(user.email_change_expires_at)
            : Number.NaN;
          const nowTimestamp = Date.parse(now);

          if (
            !user.pending_email ||
            !Number.isFinite(expiration) ||
            expiration <= nowTimestamp
          ) {
            await transaction.users.updateMany({
              where: {
                id: user.id,
                email_change_token_hash: tokenHash,
              },
              data: clearEmailChangeFields,
            });

            return { status: "expired" } as const;
          }

          const result = await transaction.users.updateMany({
            where: {
              id: user.id,
              email_change_token_hash: tokenHash,
              pending_email: user.pending_email,
              email_change_expires_at: { gt: now },
            },
            data: {
              email: user.pending_email,
              ...clearEmailChangeFields,
            },
          });

          if (result.count !== 1) {
            return { status: "invalid" } as const;
          }

          return {
            status: "confirmed",
            previousEmail: user.email,
            newEmail: user.pending_email,
          } as const;
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw duplicateEmailError();
        }

        throw error;
      }
    },
    sendChangedNotice: async (previousEmail, newEmail) => {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM;

      if (!apiKey || !from) {
        throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured.");
      }

      const resend = new Resend(apiKey);
      const email = buildEmailChangedNotice(newEmail);
      const result = await resend.emails.send({
        from,
        to: previousEmail,
        subject: EMAIL_CHANGED_SUBJECT,
        html: email.html,
        text: email.text,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    },
  };
}

export async function requestEmailChange(
  userId: string | null,
  payload: EmailChangePayload,
): Promise<void> {
  await createEmailChangeRequest(userId, payload, createDependencies());
}

export async function confirmEmailChange(token: string | null): Promise<void> {
  await confirmEmailChangeCore(token, createConfirmationDependencies());
}
