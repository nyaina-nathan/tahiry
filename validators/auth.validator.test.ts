import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as authValidator from "./auth.validator.ts";

test("validates a user patch containing username and currency", () => {
  assert.deepEqual(
    authValidator.validateUserPatchPayload({
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
      authValidator.validateUserPatchPayload({
        email: "ada@example.com",
      }),
    /Only username and currency may be updated/,
  );
});

test("rejects empty user patch payloads", () => {
  assert.throws(
    () => authValidator.validateUserPatchPayload({}),
    /At least one of username or currency is required/,
  );
});

test("validates and normalizes an email change request", () => {
  assert.deepEqual(
    authValidator.validateEmailChangePayload({
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
      authValidator.validateEmailChangePayload({
        newEmail: "ada@example.com",
        currentPassword: "correct horse battery staple",
        userId: "untrusted",
      }),
    /Only newEmail and currentPassword are allowed/,
  );
});

test("validates and normalizes a password reset email", () => {
  assert.deepEqual(
    authValidator.validatePasswordResetPayload({ email: "  ADA@EXAMPLE.COM " }),
    { email: "ada@example.com" },
  );
});

test("rejects password reset payloads with unsupported fields", () => {
  assert.throws(
    () =>
      authValidator.validatePasswordResetPayload({
        email: "ada@example.com",
        userId: "untrusted",
      }),
    /Only email is allowed/,
  );
});

test("rejects password reset payloads without a valid email", () => {
  assert.throws(
    () => authValidator.validatePasswordResetPayload({}),
    /Email is required/,
  );
  assert.throws(
    () => authValidator.validatePasswordResetPayload({ email: "not-an-email" }),
    /Email must be a valid email address/,
  );
});
