import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { buildPasswordResetEmail } from "./password-reset-email.ts";

test("includes the reset link in HTML and plain text with the five-minute expiry", () => {
  const resetUrl =
    "https://app.example.com/api/auth/password-reset/confirm?token=abc123";
  const email = buildPasswordResetEmail(resetUrl);

  assert.ok(email.html.includes(`<a href="${resetUrl}">Reset password</a>`));
  assert.ok(email.html.includes("expires in 5 minutes"));
  assert.ok(email.text.includes(resetUrl));
  assert.ok(email.text.includes("expires in 5 minutes"));
});
