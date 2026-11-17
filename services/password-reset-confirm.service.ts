import { prisma } from "@/libs/db/prisma";
import {
  confirmPasswordResetToken as confirmPasswordResetTokenCore,
  type PasswordResetConfirmDependencies,
} from "./password-reset-confirm.core";

function createDependencies(): PasswordResetConfirmDependencies {
  return {
    findValidToken: async (tokenHash, now) =>
      Boolean(
        await prisma.password_reset_token.findFirst({
          where: {
            token_hash: tokenHash,
            used_at: null,
            expires_at: { gt: new Date(now) },
          },
          select: { id: true },
        }),
      ),
    now: Date.now,
  };
}

export async function confirmPasswordResetToken(
  token: string | null,
): Promise<void> {
  await confirmPasswordResetTokenCore(token, createDependencies());
}
