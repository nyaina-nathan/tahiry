import { describe, expect, it, vi } from "vitest";
import { requestPasswordReset } from "@/features/auth/api/request-password-reset";

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("requestPasswordReset", () => {
  it("submits the requested email to the public password reset endpoint", async () => {
    const fetchMock = stubFetch(new Response(null, { status: 202 }));

    await requestPasswordReset("ada@example.com");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/password-reset");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init.body))).toEqual({ email: "ada@example.com" });
  });

  it("surfaces an API error if the reset request fails", async () => {
    stubFetch(
      Response.json(
        { error: { message: "Request could not be completed." } },
        { status: 400 },
      ),
    );

    await expect(requestPasswordReset("ada@example.com")).rejects.toThrow(
      "Request could not be completed.",
    );
  });

  it("falls back to a generic message when the error body is unusable", async () => {
    stubFetch(new Response("Internal failure", { status: 500 }));

    await expect(requestPasswordReset("ada@example.com")).rejects.toThrow(
      "We could not submit that password reset request.",
    );
  });
});
