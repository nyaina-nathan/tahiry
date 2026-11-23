import { describe, expect, it, vi } from "vitest";
import { requestEmailChange } from "@/features/settings/api/email-change-api";

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("requestEmailChange", () => {
  it("posts the requested email and current password", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 202 }));

    await requestEmailChange({
      newEmail: "new@example.com",
      currentPassword: "current-password",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/email-change");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init.body))).toEqual({
      newEmail: "new@example.com",
      currentPassword: "current-password",
    });
  });

  it("surfaces the API error message when the request fails", async () => {
    stubFetch(
      Response.json(
        { error: { message: "Current password is incorrect." } },
        { status: 401 },
      ),
    );

    await expect(
      requestEmailChange({
        newEmail: "new@example.com",
        currentPassword: "wrong-password",
      }),
    ).rejects.toThrow("Current password is incorrect.");
  });

  it("falls back to a generic message when the error body is unusable", async () => {
    stubFetch(new Response("Internal failure", { status: 500 }));

    await expect(
      requestEmailChange({
        newEmail: "new@example.com",
        currentPassword: "current-password",
      }),
    ).rejects.toThrow("Your email change request could not be sent.");
  });
});
