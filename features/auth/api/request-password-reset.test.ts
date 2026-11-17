import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import * as passwordResetApi from "./request-password-reset.ts";

test("submits the requested email to the public password reset endpoint", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(null, { status: 202 });
  };

  try {
    await passwordResetApi.requestPasswordReset("ada@example.com");

    assert.equal(requestUrl, "/api/auth/password-reset");
    assert.equal(requestInit?.method, "POST");
    assert.equal(
      new Headers(requestInit?.headers).get("Content-Type"),
      "application/json",
    );
    assert.deepEqual(JSON.parse(String(requestInit?.body)), {
      email: "ada@example.com",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("surfaces an API error if the password reset request fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json(
      { error: { message: "Request could not be completed." } },
      { status: 400 },
    );

  try {
    await assert.rejects(
      passwordResetApi.requestPasswordReset("invalid@example.com"),
      /Request could not be completed/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
