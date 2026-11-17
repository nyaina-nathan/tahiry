import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's native TypeScript runner requires the extension.
import { requestEmailChange } from "./email-change-api.ts";

test("posts the requested email and current password", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestInit: RequestInit | undefined;

  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(null, { status: 202 });
  };

  try {
    await requestEmailChange({
      newEmail: "new@example.com",
      currentPassword: "current-password",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(requestUrl, "/api/auth/email-change");
  assert.equal(requestInit?.method, "POST");
  assert.equal(requestInit?.headers && new Headers(requestInit.headers).get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(String(requestInit?.body)), {
    newEmail: "new@example.com",
    currentPassword: "current-password",
  });
});

test("surfaces the API error message when the request fails", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json(
      { error: { message: "Current password is incorrect." } },
      { status: 401 },
    );

  try {
    await assert.rejects(
      requestEmailChange({
        newEmail: "new@example.com",
        currentPassword: "wrong-password",
      }),
      /Current password is incorrect/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
