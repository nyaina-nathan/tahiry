import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as passwordResetChangeApi from "./password-reset-change.ts";

test("posts the token and new password to the password reset endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(null, { status: 204 });
  };

  try {
    await passwordResetChangeApi.changePassword(
      "a".repeat(64),
      "a-secure-password",
    );

    assert.equal(requestUrl, "/api/auth/password-reset/change");
    assert.equal(requestInit?.method, "POST");
    assert.equal(
      new Headers(requestInit?.headers).get("Content-Type"),
      "application/json",
    );
    assert.deepEqual(JSON.parse(String(requestInit?.body)), {
      token: "a".repeat(64),
      newPassword: "a-secure-password",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("surfaces the API error message when the reset request fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json(
      { error: { message: "The password reset token has expired." } },
      { status: 400 },
    );

  try {
    await assert.rejects(
      passwordResetChangeApi.changePassword("a".repeat(64), "a-secure-password"),
      /The password reset token has expired/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
