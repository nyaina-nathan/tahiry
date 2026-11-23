import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  requestPasswordReset,
  type PasswordResetDependencies,
} from "@/services/password-reset.core";

const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const TOKEN = "a".repeat(64);
const NOW = Date.parse("2026-11-17T12:00:00.000Z");

function createDependencies(
  overrides: Partial<PasswordResetDependencies> = {},
): PasswordResetDependencies {
  return {
    appUrl: "https://app.example.com",
    findUserByEmail: vi
      .fn()
      .mockResolvedValue({ id: USER_ID, email: "ada@example.com" }),
    saveToken: vi.fn().mockResolvedValue(undefined),
    deleteToken: vi.fn().mockResolvedValue(undefined),
    sendResetEmail: vi.fn().mockResolvedValue(undefined),
    createToken: vi.fn(() => TOKEN),
    now: vi.fn(() => NOW),
    ...overrides,
  };
}

describe("createPasswordResetToken", () => {
  it("creates a 256-bit opaque token encoded as hexadecimal", () => {
    expect(createPasswordResetToken()).toMatch(/^[a-f0-9]{64}$/);
  });

  it("creates a different token on every call", () => {
    expect(createPasswordResetToken()).not.toBe(createPasswordResetToken());
  });
});

describe("hashPasswordResetToken", () => {
  it("hashes tokens with SHA-256", () => {
    expect(hashPasswordResetToken(TOKEN)).toBe(
      createHash("sha256").update(TOKEN).digest("hex"),
    );
  });

  it("is deterministic for the same token", () => {
    expect(hashPasswordResetToken(TOKEN)).toBe(hashPasswordResetToken(TOKEN));
  });
});

describe("requestPasswordReset", () => {
  it("stores only the token hash for five minutes and emails a confirmation link", async () => {
    const dependencies = createDependencies();

    await requestPasswordReset("ada@example.com", dependencies);

    const expectedHash = createHash("sha256").update(TOKEN).digest("hex");
    expect(dependencies.findUserByEmail).toHaveBeenCalledWith("ada@example.com");
    expect(dependencies.saveToken).toHaveBeenCalledWith(
      USER_ID,
      expectedHash,
      "2026-11-17T12:05:00.000Z",
    );
    expect(dependencies.sendResetEmail).toHaveBeenCalledWith(
      "ada@example.com",
      `https://app.example.com/api/auth/password-change/confirm?token=${TOKEN}`,
    );
  });

  it("does nothing when no user has the requested email", async () => {
    const dependencies = createDependencies({
      findUserByEmail: vi.fn().mockResolvedValue(null),
    });

    await requestPasswordReset("unknown@example.com", dependencies);

    expect(dependencies.createToken).not.toHaveBeenCalled();
    expect(dependencies.saveToken).not.toHaveBeenCalled();
    expect(dependencies.sendResetEmail).not.toHaveBeenCalled();
  });

  it("removes the token and propagates the error when email delivery fails", async () => {
    const dependencies = createDependencies({
      sendResetEmail: vi
        .fn()
        .mockRejectedValue(new Error("Email provider unavailable")),
    });
    const expectedHash = createHash("sha256").update(TOKEN).digest("hex");

    await expect(
      requestPasswordReset("ada@example.com", dependencies),
    ).rejects.toThrow("Email provider unavailable");

    expect(dependencies.deleteToken).toHaveBeenCalledWith(
      USER_ID,
      expectedHash,
    );
  });

  it("still propagates the delivery error when cleanup also fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const dependencies = createDependencies({
      sendResetEmail: vi
        .fn()
        .mockRejectedValue(new Error("Email provider unavailable")),
      deleteToken: vi.fn().mockRejectedValue(new Error("Database unavailable")),
    });

    await expect(
      requestPasswordReset("ada@example.com", dependencies),
    ).rejects.toThrow("Email provider unavailable");

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to remove an unsent password reset token",
      expect.objectContaining({ userId: USER_ID }),
    );
  });
});
