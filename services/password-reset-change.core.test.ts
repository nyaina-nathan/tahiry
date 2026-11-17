import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as passwordResetChangeCore from "./password-reset-change.core.ts";

const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const TOKEN_ID = "password-reset-token-id";
const TOKEN = "b".repeat(64);
const NOW = Date.parse("2026-11-17T12:00:00.000Z");
const { changePassword } = passwordResetChangeCore;

function createDependencies(overrides: Record<string, unknown> = {}) {
  const calls: Record<string, unknown[][]> = {
    findValidToken: [],
    hashPassword: [],
    consumeTokenAndUpdatePassword: [],
  };

  const dependencies = {
    findValidToken: async (...args: unknown[]) => {
      calls.findValidToken.push(args);
      return { id: TOKEN_ID, userId: USER_ID };
    },
    hashPassword: async (...args: unknown[]) => {
      calls.hashPassword.push(args);
      return "bcrypt-hash-of-new-password";
    },
    consumeTokenAndUpdatePassword: async (...args: unknown[]) => {
      calls.consumeTokenAndUpdatePassword.push(args);
      return true;
    },
    now: () => NOW,
    ...overrides,
  };

  return { dependencies, calls };
}

test("hashes the new password and atomically consumes a valid reset token", async () => {
  const { dependencies, calls } = createDependencies();
  const expectedTokenHash = createHash("sha256").update(TOKEN).digest("hex");

  await changePassword(TOKEN, "new-password", dependencies);

  assert.deepEqual(calls.findValidToken, [[
    expectedTokenHash,
    "2026-11-17T12:00:00.000Z",
  ]]);
  assert.deepEqual(calls.hashPassword, [["new-password"]]);
  assert.deepEqual(calls.consumeTokenAndUpdatePassword, [[
    { id: TOKEN_ID, userId: USER_ID },
    expectedTokenHash,
    "bcrypt-hash-of-new-password",
    "2026-11-17T12:00:00.000Z",
  ]]);
});

test("rejects a malformed token without looking it up or hashing the password", async () => {
  const { dependencies, calls } = createDependencies();

  await assert.rejects(changePassword("not-a-token", "new-password", dependencies), {
    status: 400,
  });

  assert.equal(calls.findValidToken.length, 0);
  assert.equal(calls.hashPassword.length, 0);
});

test("rejects missing, expired, or used tokens without changing the password", async () => {
  const { dependencies, calls } = createDependencies({
    findValidToken: async (...args: unknown[]) => {
      calls.findValidToken.push(args);
      return null;
    },
  });

  await assert.rejects(changePassword(TOKEN, "new-password", dependencies), {
    status: 400,
  });

  assert.equal(calls.hashPassword.length, 0);
  assert.equal(calls.consumeTokenAndUpdatePassword.length, 0);
});

test("rejects a token that expires or is consumed before the password update", async () => {
  const { dependencies, calls } = createDependencies({
    consumeTokenAndUpdatePassword: async (...args: unknown[]) => {
      calls.consumeTokenAndUpdatePassword.push(args);
      return false;
    },
  });

  await assert.rejects(changePassword(TOKEN, "new-password", dependencies), {
    status: 400,
  });

  assert.equal(calls.hashPassword.length, 1);
  assert.equal(calls.consumeTokenAndUpdatePassword.length, 1);
});

test("only one concurrent request can consume the same token", async () => {
  let consumed = false;
  const { dependencies } = createDependencies({
    consumeTokenAndUpdatePassword: async () => {
      if (consumed) {
        return false;
      }
      consumed = true;
      return true;
    },
  });

  const results = await Promise.allSettled([
    changePassword(TOKEN, "first-new-password", dependencies),
    changePassword(TOKEN, "second-new-password", dependencies),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
});
