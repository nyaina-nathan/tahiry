import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { validateEmailChangePayload, validateUserPatchPayload } from "./auth.validator.ts";

test("validates a user patch containing username and currency", () => {
  assert.deepEqual(
    validateUserPatchPayload({
      username: "  Ada  ",
      currency: " EUR ",
    }),
    {
      username: "Ada",
      currency: "EUR",
    },
  );
});

test("rejects user patch payloads with unsupported fields", () => {
  assert.throws(
    () =>
      validateUserPatchPayload({
        email: "ada@example.com",
      }),
    /Only username and currency may be updated/,
  );
});

test("rejects empty user patch payloads", () => {
  assert.throws(
    () => validateUserPatchPayload({}),
    /At least one of username or currency is required/,
  );
});

test("validates and normalizes an email change request", () => {
  assert.deepEqual(
    validateEmailChangePayload({
      newEmail: "  ADA@EXAMPLE.COM ",
      currentPassword: "correct horse battery staple",
    }),
    {
      newEmail: "ada@example.com",
      currentPassword: "correct horse battery staple",
    },
  );
});

test("rejects email change requests with unsupported fields", () => {
  assert.throws(
    () =>
      validateEmailChangePayload({
        newEmail: "ada@example.com",
        currentPassword: "correct horse battery staple",
        userId: "untrusted",
      }),
    /Only newEmail and currentPassword are allowed/,
  );
});
