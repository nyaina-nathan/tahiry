import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as passwordConfirmation from "./password-confirmation.ts";

test("reports when the confirmation does not match the new password", () => {
  assert.equal(
    passwordConfirmation.getPasswordConfirmationError(
      "new-password",
      "different-password",
    ),
    "The passwords do not match.",
  );
});

test("accepts matching password values", () => {
  assert.equal(
    passwordConfirmation.getPasswordConfirmationError(
      "new-password",
      "new-password",
    ),
    null,
  );
});
