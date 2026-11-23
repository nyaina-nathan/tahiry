import { describe, expect, it, vi } from "vitest";
import { changePassword } from "@/features/auth/api/password-reset-change";

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("changePassword", () => {
  it("posts the token and new password to the password reset endpoint", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 204 }));

    await changePassword("a".repeat(64), "a-secure-password");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/password-reset/change");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init.body))).toEqual({
      token: "a".repeat(64),
      newPassword: "a-secure-password",
    });
  });

  it("surfaces the API error message when the reset request fails", async () => {
    stubFetch(
      Response.json(
        { error: { message: "The password reset token has expired." } },
        { status: 400 },
      ),
    );

    await expect(
      changePassword("a".repeat(64), "a-secure-password"),
    ).rejects.toThrow("The password reset token has expired.");
  });

  it("falls back to a generic message when the error body is unusable", async () => {
    stubFetch(new Response("Internal failure", { status: 500 }));

    await expect(
      changePassword("a".repeat(64), "a-secure-password"),
    ).rejects.toThrow("We could not update your password.");
  });

  it("falls back when the error body has no message", async () => {
    stubFetch(Response.json({ error: {} }, { status: 500 }));

    await expect(
      changePassword("a".repeat(64), "a-secure-password"),
    ).rejects.toThrow("We could not update your password.");
  });
});
