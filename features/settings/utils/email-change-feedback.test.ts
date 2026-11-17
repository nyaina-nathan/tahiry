import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { getEmailChangeResult, removeEmailChangeResultFromUrl } from "./email-change-feedback.ts";

test("reads true and false email-change results from the query string", () => {
  assert.equal(getEmailChangeResult("?emailChangeSuccess=true"), true);
  assert.equal(getEmailChangeResult("?emailChangeSuccess=false"), false);
});

test("ignores missing or invalid email-change result values", () => {
  assert.equal(getEmailChangeResult(""), null);
  assert.equal(getEmailChangeResult("?emailChangeSuccess=yes"), null);
});

test("removes only the email-change result while keeping other URL state", () => {
  assert.equal(
    removeEmailChangeResultFromUrl(
      "https://example.com/settings?tab=profile&emailChangeSuccess=true#email",
    ),
    "/settings?tab=profile#email",
  );
});
