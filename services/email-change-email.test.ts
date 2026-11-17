import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { buildEmailChangeEmail, buildEmailChangedNotice } from "./email-change-email.ts";

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

test("tells the previous account which new email address is now in use", () => {
  const email = buildEmailChangedNotice("new@example.com");

  assert.ok(email.html.includes("Your account email address was changed."));
  assert.ok(email.html.includes("new@example.com"));
  assert.ok(email.text.includes("new@example.com"));
});
