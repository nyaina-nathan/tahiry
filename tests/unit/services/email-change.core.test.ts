import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  confirmEmailChange,
  createEmailChangeToken,
  hashEmailChangeToken,
  requestEmailChange,
  type EmailChangeConfirmationDependencies,
  type EmailChangeDependencies,
} from "@/services/email-change.core";
import { expectAppErrorAsync } from "../helpers/expect-app-error";

const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const TOKEN = "a".repeat(64);
const NOW = Date.parse("2026-11-17T12:00:00.000Z");

function createDependencies(
  overrides: Partial<EmailChangeDependencies> = {},
): EmailChangeDependencies {
  return {
    appUrl: "https://app.example.com",
    findUser: vi.fn().mockResolvedValue({
      id: USER_ID,
      email: "old@example.com",
      passwordHash: "stored-password-hash",
    }),
    isEmailTaken: vi.fn().mockResolvedValue(false),
    verifyPassword: vi.fn().mockResolvedValue(true),
    savePendingChange: vi.fn().mockResolvedValue(undefined),
    clearPendingChange: vi.fn().mockResolvedValue(undefined),
    sendConfirmationEmail: vi.fn().mockResolvedValue(undefined),
    createToken: vi.fn(() => TOKEN),
    now: vi.fn(() => NOW),
    ...overrides,
  };
}

function createConfirmationDependencies(
  overrides: Partial<EmailChangeConfirmationDependencies> = {},
): EmailChangeConfirmationDependencies {
  return {
    applyChange: vi.fn().mockResolvedValue({
      status: "confirmed",
      previousEmail: "old@example.com",
      newEmail: "new@example.com",
    }),
    sendChangedNotice: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => Date.parse("2026-11-17T12:05:00.000Z")),
    ...overrides,
  };
}

describe("email change tokens", () => {
  it("creates 256-bit hexadecimal tokens", () => {
    expect(createEmailChangeToken()).toMatch(/^[a-f0-9]{64}$/);
    expect(createEmailChangeToken()).not.toBe(createEmailChangeToken());
  });

  it("hashes tokens with SHA-256", () => {
    expect(hashEmailChangeToken(TOKEN)).toBe(
      createHash("sha256").update(TOKEN).digest("hex"),
    );
  });
});

describe("requestEmailChange", () => {
  const payload = {
    newEmail: "new@example.com",
    currentPassword: "current-password",
  };

  it("stores only the token hash and emails a 10-minute confirmation link", async () => {
    const dependencies = createDependencies();

    await requestEmailChange(USER_ID, payload, dependencies);

    const expectedHash = createHash("sha256").update(TOKEN).digest("hex");
    expect(dependencies.verifyPassword).toHaveBeenCalledWith(
      "current-password",
      "stored-password-hash",
    );
    expect(dependencies.isEmailTaken).toHaveBeenCalledWith("new@example.com");
    expect(dependencies.savePendingChange).toHaveBeenCalledWith(
      USER_ID,
      "new@example.com",
      expectedHash,
      "2026-11-17T12:10:00.000Z",
    );
    expect(dependencies.sendConfirmationEmail).toHaveBeenCalledWith(
      "new@example.com",
      `https://app.example.com/api/auth/email-change/confirm?token=${TOKEN}`,
    );
  });

  it("rejects a missing or malformed user id", async () => {
    const dependencies = createDependencies();

    await expectAppErrorAsync(
      requestEmailChange(null, payload, dependencies),
      {
        title: "Unauthorized",
        message: "Authentication is missing or invalid.",
        status: 401,
        origin: "authentication",
      },
    );
    await expectAppErrorAsync(
      requestEmailChange("user-123", payload, dependencies),
      { status: 401 },
    );

    expect(dependencies.findUser).not.toHaveBeenCalled();
  });

  it("rejects a user that no longer exists", async () => {
    const dependencies = createDependencies({
      findUser: vi.fn().mockResolvedValue(null),
    });

    await expectAppErrorAsync(
      requestEmailChange(USER_ID, payload, dependencies),
      { status: 401 },
    );

    expect(dependencies.savePendingChange).not.toHaveBeenCalled();
  });

  it("rejects an incorrect current password without saving or sending", async () => {
    const dependencies = createDependencies({
      verifyPassword: vi.fn().mockResolvedValue(false),
    });

    await expectAppErrorAsync(
      requestEmailChange(USER_ID, payload, dependencies),
      {
        title: "Unauthorized",
        message: "Current password is incorrect.",
        status: 401,
      },
    );

    expect(dependencies.savePendingChange).not.toHaveBeenCalled();
    expect(dependencies.sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it("rejects an email already owned by another account", async () => {
    const dependencies = createDependencies({
      isEmailTaken: vi.fn().mockResolvedValue(true),
    });

    await expectAppErrorAsync(
      requestEmailChange(USER_ID, payload, dependencies),
      {
        title: "Conflict",
        message: "Email is already registered.",
        status: 409,
      },
    );

    expect(dependencies.savePendingChange).not.toHaveBeenCalled();
    expect(dependencies.sendConfirmationEmail).not.toHaveBeenCalled();
  });

  it("clears the pending change and propagates delivery errors", async () => {
    const dependencies = createDependencies({
      sendConfirmationEmail: vi
        .fn()
        .mockRejectedValue(new Error("Email provider unavailable")),
    });
    const expectedHash = createHash("sha256").update(TOKEN).digest("hex");

    await expect(
      requestEmailChange(USER_ID, payload, dependencies),
    ).rejects.toThrow("Email provider unavailable");

    expect(dependencies.clearPendingChange).toHaveBeenCalledWith(
      USER_ID,
      expectedHash,
    );
  });

  it("still propagates the delivery error when cleanup also fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const dependencies = createDependencies({
      sendConfirmationEmail: vi
        .fn()
        .mockRejectedValue(new Error("Email provider unavailable")),
      clearPendingChange: vi
        .fn()
        .mockRejectedValue(new Error("Database unavailable")),
    });

    await expect(
      requestEmailChange(USER_ID, payload, dependencies),
    ).rejects.toThrow("Email provider unavailable");

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to clear unsent email change request",
      expect.objectContaining({ userId: USER_ID }),
    );
  });
});

describe("confirmEmailChange", () => {
  it("confirms a valid token and notifies the previous email address", async () => {
    const dependencies = createConfirmationDependencies();

    await confirmEmailChange(TOKEN, dependencies);

    expect(dependencies.applyChange).toHaveBeenCalledWith(
      createHash("sha256").update(TOKEN).digest("hex"),
      "2026-11-17T12:05:00.000Z",
    );
    expect(dependencies.sendChangedNotice).toHaveBeenCalledWith(
      "old@example.com",
      "new@example.com",
    );
  });

  it("accepts uppercase hexadecimal tokens", async () => {
    const dependencies = createConfirmationDependencies();

    await confirmEmailChange("A".repeat(64), dependencies);

    expect(dependencies.applyChange).toHaveBeenCalledWith(
      createHash("sha256").update("A".repeat(64)).digest("hex"),
      "2026-11-17T12:05:00.000Z",
    );
  });

  it("rejects an expired token", async () => {
    const dependencies = createConfirmationDependencies({
      applyChange: vi.fn().mockResolvedValue({ status: "expired" }),
    });

    await expectAppErrorAsync(confirmEmailChange(TOKEN, dependencies), {
      title: "Bad Request",
      message:
        "The email change token is invalid, expired, or has already been used.",
      status: 400,
      origin: "authentication",
    });

    expect(dependencies.sendChangedNotice).not.toHaveBeenCalled();
  });

  it("rejects an invalid or already-used token", async () => {
    const dependencies = createConfirmationDependencies({
      applyChange: vi.fn().mockResolvedValue({ status: "invalid" }),
    });

    await expectAppErrorAsync(confirmEmailChange(TOKEN, dependencies), {
      status: 400,
    });

    expect(dependencies.sendChangedNotice).not.toHaveBeenCalled();
  });

  it("rejects missing or malformed confirmation tokens without querying the store", async () => {
    const dependencies = createConfirmationDependencies();

    await expectAppErrorAsync(confirmEmailChange(null, dependencies), {
      status: 400,
    });
    await expectAppErrorAsync(confirmEmailChange("not-a-token", dependencies), {
      status: 400,
    });

    expect(dependencies.applyChange).not.toHaveBeenCalled();
  });

  it("keeps a confirmed change successful if the old-address notice fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const dependencies = createConfirmationDependencies({
      sendChangedNotice: vi
        .fn()
        .mockRejectedValue(new Error("Email provider unavailable")),
    });

    await expect(confirmEmailChange(TOKEN, dependencies)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(
      "Email changed, but the old-address notification failed.",
      expect.any(Error),
    );
  });
});
