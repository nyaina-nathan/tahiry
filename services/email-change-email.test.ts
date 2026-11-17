import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { buildEmailChangeEmail } from "./email-change-email.ts";

test("includes a short HTML confirmation link and the full URL fallback", () => {
  const confirmationUrl =
    "https://app.example.com/api/auth/email-change/confirm?token=abc123";
  const email = buildEmailChangeEmail(confirmationUrl);

  assert.ok(
    email.html.includes(
      `<a href="${confirmationUrl}">Confirm email change</a>`,
    ),
  );
  assert.ok(email.html.includes(confirmationUrl));
  assert.ok(email.text.includes(confirmationUrl));
});
