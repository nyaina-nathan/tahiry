import bcrypt from "bcrypt";
import { prisma } from "@/libs/db/prisma";
import type { PasswordResetChangePayload } from "@/validators/auth.validator";
import {
  changePassword as changePasswordCore,
  type PasswordResetChangeDependencies,
} from "./password-reset-change.core";

const PASSWORD_HASH_ROUNDS = 12;

function createDependencies(): PasswordResetChangeDependencies {
  return {
    findValidToken: async (tokenHash, now) => {
      const token = await prisma.password_reset_token.findFirst({
        where: {
          token_hash: tokenHash,
          used_at: null,
          expires_at: { gt: new Date(now) },
        },
        select: { id: true, id_user: true },
      });

      return token ? { id: token.id, userId: token.id_user } : null;
    },
    hashPassword: (password) => bcrypt.hash(password, PASSWORD_HASH_ROUNDS),
    consumeTokenAndUpdatePassword: async (
      token,
      tokenHash,
      passwordHash,
      now,
    ) =>
      prisma.$transaction(async (transaction) => {
        const nowDate = new Date(now);
        const consumed = await transaction.password_reset_token.updateMany({
          where: {
            id: token.id,
            id_user: token.userId,
            token_hash: tokenHash,
            used_at: null,
            expires_at: { gt: nowDate },
          },
          data: { used_at: nowDate },
        });

        if (consumed.count !== 1) {
          return false;
        }

        await transaction.users.update({
          where: { id: token.userId },
          data: { password_hash: passwordHash },
        });

        return true;
      }),
    now: Date.now,
  };
}

export async function changePassword(
  payload: PasswordResetChangePayload,
): Promise<void> {
  await changePasswordCore(
    payload.token,
    payload.newPassword,
    createDependencies(),
  );
}
