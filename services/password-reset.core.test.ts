import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as passwordResetCore from "./password-reset.core.ts";

const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const TOKEN = "a".repeat(64);
const NOW = Date.parse("2026-11-17T12:00:00.000Z");
const { createPasswordResetToken, requestPasswordReset } = passwordResetCore;

function createDependencies(overrides: Record<string, unknown> = {}) {
  const calls: Record<string, unknown[][]> = {
    findUserByEmail: [],
    saveToken: [],
    deleteToken: [],
    sendResetEmail: [],
    createToken: [],
  };

  const dependencies = {
    appUrl: "https://app.example.com",
    findUserByEmail: async (...args: unknown[]) => {
      calls.findUserByEmail.push(args);
      return { id: USER_ID, email: "ada@example.com" };
    },
    saveToken: async (...args: unknown[]) => {
      calls.saveToken.push(args);
    },
    deleteToken: async (...args: unknown[]) => {
      calls.deleteToken.push(args);
    },
    sendResetEmail: async (...args: unknown[]) => {
      calls.sendResetEmail.push(args);
    },
    createToken: () => {
      calls.createToken.push([]);
      return TOKEN;
    },
    now: () => NOW,
    ...overrides,
  };

  return { dependencies, calls };
}

test("creates a 256-bit opaque token encoded as hexadecimal", () => {
  const token = createPasswordResetToken();

  assert.match(token, /^[a-f0-9]{64}$/);
});

test("stores only the token hash for five minutes and emails a confirmation link", async () => {
  const { dependencies, calls } = createDependencies();

  await requestPasswordReset("ada@example.com", dependencies);

  const expectedHash = createHash("sha256").update(TOKEN).digest("hex");
  assert.deepEqual(calls.saveToken, [[
    USER_ID,
    expectedHash,
    "2026-11-17T12:05:00.000Z",
  ]]);
  assert.deepEqual(calls.sendResetEmail, [[
    "ada@example.com",
    `https://app.example.com/api/auth/password-reset/confirm?token=${TOKEN}`,
  ]]);
});

test("does not create a token or send email when no user has the requested email", async () => {
  const { dependencies, calls } = createDependencies({
    findUserByEmail: async (...args: unknown[]) => {
      calls.findUserByEmail.push(args);
      return null;
    },
  });

  await requestPasswordReset("unknown@example.com", dependencies);

  assert.equal(calls.saveToken.length, 0);
  assert.equal(calls.sendResetEmail.length, 0);
  assert.equal(calls.createToken.length, 0);
});

test("removes the token record and propagates the error if email delivery fails", async () => {
  const { dependencies, calls } = createDependencies({
    sendResetEmail: async (...args: unknown[]) => {
      calls.sendResetEmail.push(args);
      throw new Error("Email provider unavailable");
    },
  });
  const expectedHash = createHash("sha256").update(TOKEN).digest("hex");

  await assert.rejects(
    requestPasswordReset("ada@example.com", dependencies),
    /Email provider unavailable/,
  );

  assert.deepEqual(calls.deleteToken, [[USER_ID, expectedHash]]);
});
