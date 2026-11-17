import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as passwordResetConfirmCore from "./password-reset-confirm.core.ts";

const TOKEN = "c".repeat(64);
const NOW = Date.parse("2026-11-17T12:00:00.000Z");
const { confirmPasswordResetToken } = passwordResetConfirmCore;

test("accepts an unexpired token by its stored hash", async () => {
  const calls: unknown[][] = [];

  await confirmPasswordResetToken(TOKEN, {
    findValidToken: async (...args: unknown[]) => {
      calls.push(args);
      return true;
    },
    now: () => NOW,
  });

  assert.deepEqual(calls, [[
    createHash("sha256").update(TOKEN).digest("hex"),
    "2026-11-17T12:00:00.000Z",
  ]]);
});

test("rejects a missing or malformed token without querying storage", async () => {
  let lookupCount = 0;
  const dependencies = {
    findValidToken: async () => {
      lookupCount += 1;
      return true;
    },
    now: () => NOW,
  };

  await assert.rejects(confirmPasswordResetToken(null, dependencies), {
    status: 400,
  });
  await assert.rejects(confirmPasswordResetToken("invalid", dependencies), {
    status: 400,
  });
  assert.equal(lookupCount, 0);
});

test("rejects expired or already-used tokens", async () => {
  await assert.rejects(
    confirmPasswordResetToken(TOKEN, {
      findValidToken: async () => false,
      now: () => NOW,
    }),
    { status: 400 },
  );
});
