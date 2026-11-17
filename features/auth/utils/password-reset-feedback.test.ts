import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as passwordResetFeedback from "./password-reset-feedback.ts";

test("recognizes only the password-reset failure redirect flag", () => {
  assert.equal(
    passwordResetFeedback.getPasswordResetFailure("?isPasswordResetFail=true"),
    true,
  );
  assert.equal(
    passwordResetFeedback.getPasswordResetFailure("?isPasswordResetFail=false"),
    false,
  );
  assert.equal(passwordResetFeedback.getPasswordResetFailure(""), false);
});

test("removes the failure flag while preserving other URL state", () => {
  assert.equal(
    passwordResetFeedback.removePasswordResetFailureFromUrl(
      "https://example.com/login?next=%2Faccounts&isPasswordResetFail=true#form",
    ),
    "/login?next=%2Faccounts#form",
  );
});
