import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  changePassword,
  type PasswordResetChangeDependencies,
} from "@/services/password-reset-change.core";
import { expectAppErrorAsync } from "../helpers/expect-app-error";

const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const TOKEN_ID = "password-reset-token-id";
const TOKEN = "b".repeat(64);
const NOW = Date.parse("2026-11-17T12:00:00.000Z");

function createDependencies(
  overrides: Partial<PasswordResetChangeDependencies> = {},
): PasswordResetChangeDependencies {
  return {
    findValidToken: vi
      .fn()
      .mockResolvedValue({ id: TOKEN_ID, userId: USER_ID }),
    hashPassword: vi.fn().mockResolvedValue("bcrypt-hash-of-new-password"),
    consumeTokenAndUpdatePassword: vi.fn().mockResolvedValue(true),
    now: vi.fn(() => NOW),
    ...overrides,
  };
}

describe("changePassword", () => {
  it("hashes the new password and atomically consumes a valid reset token", async () => {
    const dependencies = createDependencies();
    const expectedTokenHash = createHash("sha256").update(TOKEN).digest("hex");

    await changePassword(TOKEN, "new-password", dependencies);

    expect(dependencies.findValidToken).toHaveBeenCalledWith(
      expectedTokenHash,
      "2026-11-17T12:00:00.000Z",
    );
    expect(dependencies.hashPassword).toHaveBeenCalledWith("new-password");
    expect(dependencies.consumeTokenAndUpdatePassword).toHaveBeenCalledWith(
      { id: TOKEN_ID, userId: USER_ID },
      expectedTokenHash,
      "bcrypt-hash-of-new-password",
      "2026-11-17T12:00:00.000Z",
    );
  });

  it("rejects a malformed token without looking it up or hashing the password", async () => {
    const dependencies = createDependencies();

    await expectAppErrorAsync(
      changePassword("not-a-token", "new-password", dependencies),
      {
        title: "Bad Request",
        message:
          "The password reset token is invalid, expired, or has already been used.",
        status: 400,
        origin: "authentication",
      },
    );

    expect(dependencies.findValidToken).not.toHaveBeenCalled();
    expect(dependencies.hashPassword).not.toHaveBeenCalled();
  });

  it("rejects missing, expired, or used tokens without changing the password", async () => {
    const dependencies = createDependencies({
      findValidToken: vi.fn().mockResolvedValue(null),
    });

    await expectAppErrorAsync(
      changePassword(TOKEN, "new-password", dependencies),
      { status: 400 },
    );

    expect(dependencies.hashPassword).not.toHaveBeenCalled();
    expect(dependencies.consumeTokenAndUpdatePassword).not.toHaveBeenCalled();
  });

  it("rejects a token that expires or is consumed before the password update", async () => {
    const dependencies = createDependencies({
      consumeTokenAndUpdatePassword: vi.fn().mockResolvedValue(false),
    });

    await expectAppErrorAsync(
      changePassword(TOKEN, "new-password", dependencies),
      { status: 400 },
    );

    expect(dependencies.hashPassword).toHaveBeenCalledTimes(1);
    expect(dependencies.consumeTokenAndUpdatePassword).toHaveBeenCalledTimes(1);
  });

  it("allows only one concurrent request to consume the same token", async () => {
    let consumed = false;
    const dependencies = createDependencies({
      consumeTokenAndUpdatePassword: vi.fn(async () => {
        if (consumed) {
          return false;
        }
        consumed = true;
        return true;
      }),
    });

    const results = await Promise.allSettled([
      changePassword(TOKEN, "first-new-password", dependencies),
      changePassword(TOKEN, "second-new-password", dependencies),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(
      1,
    );
  });
});
