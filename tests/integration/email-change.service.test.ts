import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmEmailChange,
  requestEmailChange,
} from "@/services/email-change.service";
import { prisma, resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import { TEST_PASSWORD, createUser } from "./helpers/fixtures";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

beforeEach(async () => {
  await resetDatabase();
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
});

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function tokenFromFirstEmail(): string {
  const message = mockSend.mock.calls[0]?.[0] as { html?: string } | undefined;
  const match = message?.html ? /token=([a-f0-9]{64})/.exec(message.html) : null;

  if (!match) {
    throw new Error("The sent email did not contain a confirmation token.");
  }

  return match[1];
}

async function requestConfirmation(userId: string, newEmail: string) {
  await requestEmailChange(userId, {
    newEmail,
    currentPassword: TEST_PASSWORD,
  });

  return tokenFromFirstEmail();
}

describe("requestEmailChange", () => {
  it("stores only the token hash for ten minutes and emails the new address", async () => {
    const user = await createUser({ email: "old@example.com" });
    const before = Date.now();

    await requestEmailChange(user.id, {
      newEmail: "new@example.com",
      currentPassword: TEST_PASSWORD,
    });

    const token = tokenFromFirstEmail();
    const stored = await prisma.users.findUniqueOrThrow({
      where: { id: user.id },
    });

    expect(stored.email).toBe("old@example.com");
    expect(stored.pending_email).toBe("new@example.com");
    expect(stored.email_change_token_hash).toBe(hashToken(token));
    expect(stored.email_change_token_hash).not.toBe(token);

    const expiresInMs = Date.parse(stored.email_change_expires_at!) - before;
    expect(expiresInMs).toBeGreaterThan(9 * 60 * 1000);
    expect(expiresInMs).toBeLessThan(11 * 60 * 1000);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "new@example.com",
        subject: "Confirm your new email address",
      }),
    );
  });

  it("rejects an incorrect current password without saving or sending", async () => {
    const user = await createUser({ email: "old@example.com" });

    await expectAppErrorAsync(
      requestEmailChange(user.id, {
        newEmail: "new@example.com",
        currentPassword: "wrong-password",
      }),
      {
        title: "Unauthorized",
        message: "Current password is incorrect.",
        status: 401,
        origin: "authentication",
      },
    );

    const stored = await prisma.users.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(stored.pending_email).toBeNull();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects an email already used by another account", async () => {
    const user = await createUser({ email: "old@example.com" });
    await createUser({ email: "taken@example.com" });

    await expectAppErrorAsync(
      requestEmailChange(user.id, {
        newEmail: "taken@example.com",
        currentPassword: TEST_PASSWORD,
      }),
      {
        title: "Conflict",
        message: "Email is already registered.",
        status: 409,
        origin: "authentication",
      },
    );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects invalid or unknown users", async () => {
    const payload = {
      newEmail: "new@example.com",
      currentPassword: TEST_PASSWORD,
    };

    await expectAppErrorAsync(requestEmailChange(null, payload), {
      status: 401,
    });
    await expectAppErrorAsync(
      requestEmailChange("123e4567-e89b-42d3-a456-426614174000", payload),
      { status: 401 },
    );
  });
});

describe("confirmEmailChange", () => {
  it("swaps the email, clears the pending fields and notifies the old address", async () => {
    const user = await createUser({ email: "old@example.com" });
    const token = await requestConfirmation(user.id, "new@example.com");

    await confirmEmailChange(token);

    const stored = await prisma.users.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(stored.email).toBe("new@example.com");
    expect(stored.pending_email).toBeNull();
    expect(stored.email_change_token_hash).toBeNull();
    expect(stored.email_change_expires_at).toBeNull();

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        to: "old@example.com",
        subject: "Your account email address was changed",
      }),
    );
  });

  it("rejects and clears an expired change", async () => {
    const user = await createUser({ email: "old@example.com" });
    const token = await requestConfirmation(user.id, "new@example.com");
    await prisma.users.update({
      where: { id: user.id },
      data: {
        email_change_expires_at: new Date(Date.now() - 1000).toISOString(),
      },
    });

    await expectAppErrorAsync(confirmEmailChange(token), {
      title: "Bad Request",
      message:
        "The email change token is invalid, expired, or has already been used.",
      status: 400,
    });

    const stored = await prisma.users.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(stored.email).toBe("old@example.com");
    expect(stored.pending_email).toBeNull();
    expect(stored.email_change_token_hash).toBeNull();
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("rejects unknown or malformed tokens", async () => {
    await expectAppErrorAsync(confirmEmailChange("not-a-token"), {
      status: 400,
    });
    await expectAppErrorAsync(confirmEmailChange("a".repeat(64)), {
      status: 400,
    });
  });

  it("replays cleanly as invalid after a successful confirmation", async () => {
    const user = await createUser({ email: "old@example.com" });
    const token = await requestConfirmation(user.id, "new@example.com");
    await confirmEmailChange(token);

    await expectAppErrorAsync(confirmEmailChange(token), { status: 400 });
  });

  it("maps a concurrent email collision to a conflict", async () => {
    const user = await createUser({ email: "old@example.com" });
    const token = await requestConfirmation(user.id, "new@example.com");
    await createUser({ email: "new@example.com" });

    await expectAppErrorAsync(confirmEmailChange(token), {
      title: "Conflict",
      message: "Email is already registered.",
      status: 409,
    });
  });

  it("keeps the change successful when the old-address notice fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = await createUser({ email: "old@example.com" });
    const token = await requestConfirmation(user.id, "new@example.com");
    mockSend.mockRejectedValueOnce(new Error("Email provider unavailable"));

    await expect(confirmEmailChange(token)).resolves.toBeUndefined();

    const stored = await prisma.users.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(stored.email).toBe("new@example.com");
    expect(consoleError).toHaveBeenCalledWith(
      "Email changed, but the old-address notification failed.",
      expect.any(Error),
    );
  });
});
