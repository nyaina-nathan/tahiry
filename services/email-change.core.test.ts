import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { confirmEmailChange, requestEmailChange } from "./email-change.core.ts";

const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const TOKEN = "a".repeat(64);

function createDependencies(overrides: Record<string, unknown> = {}) {
  const calls: Record<string, unknown[]> = {
    findUser: [],
    isEmailTaken: [],
    savePendingChange: [],
    clearPendingChange: [],
    sendConfirmationEmail: [],
  };

  const dependencies = {
    appUrl: "https://app.example.com",
    findUser: async (...args: unknown[]) => {
      calls.findUser.push(args);
      return {
        id: USER_ID,
        email: "old@example.com",
        passwordHash: "stored-password-hash",
      };
    },
    isEmailTaken: async (...args: unknown[]) => {
      calls.isEmailTaken.push(args);
      return false;
    },
    verifyPassword: async () => true,
    savePendingChange: async (...args: unknown[]) => {
      calls.savePendingChange.push(args);
    },
    clearPendingChange: async (...args: unknown[]) => {
      calls.clearPendingChange.push(args);
    },
    sendConfirmationEmail: async (...args: unknown[]) => {
      calls.sendConfirmationEmail.push(args);
    },
    createToken: () => TOKEN,
    now: () => Date.parse("2026-11-17T12:00:00.000Z"),
    ...overrides,
  };

  return { dependencies, calls };
}

test("stores only the token hash and emails a 10-minute confirmation link", async () => {
  const { dependencies, calls } = createDependencies();

  await requestEmailChange(
    USER_ID,
    { newEmail: "new@example.com", currentPassword: "current-password" },
    dependencies,
  );

  const expectedHash = createHash("sha256").update(TOKEN).digest("hex");
  assert.deepEqual(calls.savePendingChange, [[
    USER_ID,
    "new@example.com",
    expectedHash,
    "2026-11-17T12:10:00.000Z",
  ]]);
  assert.deepEqual(calls.sendConfirmationEmail, [[
    "new@example.com",
    `https://app.example.com/api/auth/email-change/confirm?token=${TOKEN}`,
  ]]);
});

test("rejects an incorrect current password without saving or sending", async () => {
  const { dependencies, calls } = createDependencies({
    verifyPassword: async () => false,
  });

  await assert.rejects(
    requestEmailChange(
      USER_ID,
      { newEmail: "new@example.com", currentPassword: "current-password" },
      dependencies,
    ),
    { status: 401 },
  );

  assert.equal(calls.savePendingChange.length, 0);
  assert.equal(calls.sendConfirmationEmail.length, 0);
});

test("rejects an email already owned by another account", async () => {
  const { dependencies, calls } = createDependencies({
    isEmailTaken: async () => true,
  });

  await assert.rejects(
    requestEmailChange(
      USER_ID,
      { newEmail: "new@example.com", currentPassword: "current-password" },
      dependencies,
    ),
    { status: 409 },
  );

  assert.equal(calls.savePendingChange.length, 0);
  assert.equal(calls.sendConfirmationEmail.length, 0);
});

test("confirms a valid token and notifies the previous email address", async () => {
  const calls: unknown[][] = [];
  const dependencies = {
    now: () => Date.parse("2026-11-17T12:05:00.000Z"),
    applyChange: async (...args: unknown[]) => {
      calls.push(["applyChange", ...args]);
      return {
        status: "confirmed" as const,
        previousEmail: "old@example.com",
        newEmail: "new@example.com",
      };
    },
    sendChangedNotice: async (...args: unknown[]) => {
      calls.push(["sendChangedNotice", ...args]);
    },
  };

  await confirmEmailChange(TOKEN, dependencies);

  assert.deepEqual(calls, [
    [
      "applyChange",
      createHash("sha256").update(TOKEN).digest("hex"),
      "2026-11-17T12:05:00.000Z",
    ],
    ["sendChangedNotice", "old@example.com", "new@example.com"],
  ]);
});

test("rejects an expired token after clearing its pending change", async () => {
  const calls: unknown[][] = [];
  const dependencies = {
    now: () => Date.parse("2026-11-17T12:11:00.000Z"),
    applyChange: async (...args: unknown[]) => {
      calls.push(["applyChange", ...args]);
      return { status: "expired" as const };
    },
    sendChangedNotice: async (...args: unknown[]) => {
      calls.push(["sendChangedNotice", ...args]);
    },
  };

  await assert.rejects(confirmEmailChange(TOKEN, dependencies), {
    status: 400,
  });

  assert.deepEqual(calls, [[
    "applyChange",
    createHash("sha256").update(TOKEN).digest("hex"),
    "2026-11-17T12:11:00.000Z",
  ]]);
});

test("rejects malformed confirmation tokens without querying the store", async () => {
  let applyCalls = 0;
  const dependencies = {
    now: () => Date.parse("2026-11-17T12:05:00.000Z"),
    applyChange: async () => {
      applyCalls += 1;
      return { status: "invalid" as const };
    },
    sendChangedNotice: async () => {},
  };

  await assert.rejects(confirmEmailChange("not-a-token", dependencies), {
    status: 400,
  });
  assert.equal(applyCalls, 0);
});

test("keeps a confirmed change successful if the old-address notice fails", async () => {
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await assert.doesNotReject(
      confirmEmailChange(TOKEN, {
        now: () => Date.parse("2026-11-17T12:05:00.000Z"),
        applyChange: async () => ({
          status: "confirmed" as const,
          previousEmail: "old@example.com",
          newEmail: "new@example.com",
        }),
        sendChangedNotice: async () => {
          throw new Error("Email provider unavailable");
        },
      }),
    );
  } finally {
    console.error = originalConsoleError;
  }
});
