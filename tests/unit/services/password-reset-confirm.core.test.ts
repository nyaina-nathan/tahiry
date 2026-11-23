import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  confirmPasswordResetToken,
  type PasswordResetConfirmDependencies,
} from "@/services/password-reset-confirm.core";
import { expectAppErrorAsync } from "../helpers/expect-app-error";

const TOKEN = "c".repeat(64);
const NOW = Date.parse("2026-11-17T12:00:00.000Z");

function createDependencies(
  overrides: Partial<PasswordResetConfirmDependencies> = {},
): PasswordResetConfirmDependencies {
  return {
    findValidToken: vi.fn().mockResolvedValue(true),
    now: vi.fn(() => NOW),
    ...overrides,
  };
}

describe("confirmPasswordResetToken", () => {
  it("accepts an unexpired token by its stored hash", async () => {
    const dependencies = createDependencies();

    await confirmPasswordResetToken(TOKEN, dependencies);

    expect(dependencies.findValidToken).toHaveBeenCalledWith(
      createHash("sha256").update(TOKEN).digest("hex"),
      "2026-11-17T12:00:00.000Z",
    );
  });

  it("rejects a missing or malformed token without querying storage", async () => {
    const dependencies = createDependencies();

    await expectAppErrorAsync(
      confirmPasswordResetToken(null, dependencies),
      {
        title: "Bad Request",
        message:
          "The password reset link is invalid or expired. Request a new one to try again.",
        status: 400,
        origin: "authentication",
      },
    );
    await expectAppErrorAsync(
      confirmPasswordResetToken("invalid", dependencies),
      { status: 400 },
    );

    expect(dependencies.findValidToken).not.toHaveBeenCalled();
  });

  it("rejects expired or already-used tokens", async () => {
    const dependencies = createDependencies({
      findValidToken: vi.fn().mockResolvedValue(false),
    });

    await expectAppErrorAsync(
      confirmPasswordResetToken(TOKEN, dependencies),
      { status: 400 },
    );
  });
});
