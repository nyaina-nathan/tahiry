import { createHash } from "node:crypto";
import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginUser } from "@/services/auth.service";
import { changePassword } from "@/services/password-reset-change.service";
import { confirmPasswordResetToken } from "@/services/password-reset-confirm.service";
import { requestPasswordReset } from "@/services/password-reset.service";
import { prisma, resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import { TEST_PASSWORD, createUser } from "./helpers/fixtures";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

const EMAIL = "ada@example.com";

beforeEach(async () => {
  await resetDatabase();
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
});

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function tokenFromLastEmail(): string {
  const message = mockSend.mock.calls.at(-1)?.[0] as
    | { html?: string }
    | undefined;
  const match = message?.html ? /token=([a-f0-9]{64})/.exec(message.html) : null;

  if (!match) {
    throw new Error("The sent email did not contain a reset token.");
  }

  return match[1];
}

async function requestToken(): Promise<string> {
  await requestPasswordReset({ email: EMAIL });
  return tokenFromLastEmail();
}

describe("requestPasswordReset", () => {
  it("stores only the token hash for five minutes and sends a reset link", async () => {
    const user = await createUser({ email: EMAIL });
    const before = Date.now();

    await requestPasswordReset({ email: EMAIL });

    const token = tokenFromLastEmail();
    const stored = await prisma.password_reset_token.findFirstOrThrow({
      where: { id_user: user.id },
    });

    expect(stored.token_hash).toBe(hashToken(token));
    expect(stored.token_hash).not.toBe(token);
    expect(stored.used_at).toBeNull();
    const expiresInMs = stored.expires_at.getTime() - before;
    expect(expiresInMs).toBeGreaterThan(4 * 60 * 1000);
    expect(expiresInMs).toBeLessThan(6 * 60 * 1000);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: EMAIL,
        subject: "Reset your password",
      }),
    );
  });

  it("does not reveal or store anything for an unknown email", async () => {
    await requestPasswordReset({ email: "unknown@example.com" });

    expect(mockSend).not.toHaveBeenCalled();
    await expect(prisma.password_reset_token.count()).resolves.toBe(0);
  });

  it("removes the token when email delivery fails", async () => {
    await createUser({ email: EMAIL });
    mockSend.mockRejectedValueOnce(new Error("Email provider unavailable"));

    await expect(requestPasswordReset({ email: EMAIL })).rejects.toThrow(
      "Email provider unavailable",
    );

    await expect(prisma.password_reset_token.count()).resolves.toBe(0);
  });

  it("removes the token when the provider returns an error result", async () => {
    await createUser({ email: EMAIL });
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Provider rejected the message" },
    });

    await expect(requestPasswordReset({ email: EMAIL })).rejects.toThrow(
      "Provider rejected the message",
    );

    await expect(prisma.password_reset_token.count()).resolves.toBe(0);
  });
});

describe("confirmPasswordResetToken", () => {
  it("accepts an unexpired unused token", async () => {
    await createUser({ email: EMAIL });
    const token = await requestToken();

    await expect(confirmPasswordResetToken(token)).resolves.toBeUndefined();
  });

  it("rejects an expired token", async () => {
    const user = await createUser({ email: EMAIL });
    const token = await requestToken();
    await prisma.password_reset_token.updateMany({
      where: { id_user: user.id },
      data: { expires_at: new Date(Date.now() - 1000) },
    });

    await expectAppErrorAsync(confirmPasswordResetToken(token), {
      title: "Bad Request",
      message:
        "The password reset link is invalid or expired. Request a new one to try again.",
      status: 400,
      origin: "authentication",
    });
  });

  it("rejects a used token", async () => {
    const user = await createUser({ email: EMAIL });
    const token = await requestToken();
    await prisma.password_reset_token.updateMany({
      where: { id_user: user.id },
      data: { used_at: new Date() },
    });

    await expectAppErrorAsync(confirmPasswordResetToken(token), {
      status: 400,
    });
  });

  it("rejects a malformed token without touching the database", async () => {
    await expectAppErrorAsync(confirmPasswordResetToken("not-a-token"), {
      status: 400,
    });
  });
});

describe("changePassword", () => {
  it("updates the password and consumes the token", async () => {
    const user = await createUser({ email: EMAIL });
    const token = await requestToken();

    await changePassword({ token, newPassword: "brand-new-password" });

    const stored = await prisma.password_reset_token.findFirstOrThrow({
      where: { id_user: user.id },
    });
    expect(stored.used_at).not.toBeNull();

    const updatedUser = await prisma.users.findUniqueOrThrow({
      where: { id: user.id },
    });
    await expect(
      bcrypt.compare("brand-new-password", updatedUser.password_hash),
    ).resolves.toBe(true);
    await expect(
      loginUser({ email: EMAIL, password: "brand-new-password" }),
    ).resolves.toMatchObject({ user: { id: user.id } });
    await expectAppErrorAsync(
      loginUser({ email: EMAIL, password: TEST_PASSWORD }),
      { status: 401 },
    );
  });

  it("rejects a token that was already consumed", async () => {
    await createUser({ email: EMAIL });
    const token = await requestToken();
    await changePassword({ token, newPassword: "brand-new-password" });

    await expectAppErrorAsync(
      changePassword({ token, newPassword: "another-password" }),
      {
        title: "Bad Request",
        message:
          "The password reset token is invalid, expired, or has already been used.",
        status: 400,
      },
    );
    await expectAppErrorAsync(confirmPasswordResetToken(token), {
      status: 400,
    });
  });

  it("rejects an expired token without changing the password", async () => {
    const user = await createUser({ email: EMAIL });
    const token = await requestToken();
    await prisma.password_reset_token.updateMany({
      where: { id_user: user.id },
      data: { expires_at: new Date(Date.now() - 1000) },
    });

    await expectAppErrorAsync(
      changePassword({ token, newPassword: "brand-new-password" }),
      { status: 400 },
    );

    await expect(
      loginUser({ email: EMAIL, password: TEST_PASSWORD }),
    ).resolves.toMatchObject({ user: { id: user.id } });
  });

  it("allows only one of two concurrent password changes", async () => {
    await createUser({ email: EMAIL });
    const token = await requestToken();

    const results = await Promise.allSettled([
      changePassword({ token, newPassword: "first-new-password" }),
      changePassword({ token, newPassword: "second-new-password" }),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
  });
});
