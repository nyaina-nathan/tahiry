import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { enforceRateLimitMock } = vi.hoisted(() => ({
  enforceRateLimitMock: vi.fn(),
}));

vi.mock("@/libs/rate-limit/rate-limit", () => ({
  enforceRateLimit: enforceRateLimitMock,
}));

import { withRateLimit } from "@/libs/api/with-rate-limit";

function makeRequest(): NextRequest {
  return {} as NextRequest;
}

function makeResult(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    limit: 120,
    remaining: 119,
    reset: Date.now() + 60_000,
    ...overrides,
  };
}

describe("withRateLimit", () => {
  beforeEach(() => {
    enforceRateLimitMock.mockReset();
  });

  it("runs the handler and exposes rate-limit headers when allowed", async () => {
    const result = makeResult();
    enforceRateLimitMock.mockResolvedValue(result);
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const wrapped = withRateLimit("api.read", handler);

    const response = await wrapped(makeRequest(), {});

    expect(response.status).toBe(200);
    expect(enforceRateLimitMock).toHaveBeenCalledWith(
      expect.anything(),
      "api.read",
    );
    expect(handler).toHaveBeenCalledTimes(1);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("120");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("119");
  });

  it("returns 429 without running the handler when the limit is exceeded", async () => {
    const reset = Date.now() + 30_000;
    enforceRateLimitMock.mockResolvedValue(
      makeResult({ success: false, remaining: 0, reset }),
    );
    const handler = vi.fn(async () => Response.json({ ok: true }));
    const wrapped = withRateLimit("api.write", handler);

    const response = await wrapped(makeRequest(), {});

    expect(response.status).toBe(429);
    expect(handler).not.toHaveBeenCalled();
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("120");
    await expect(response.json()).resolves.toEqual({
      error: {
        title: "Too Many Requests",
        message: "Too many requests. Please try again later.",
        status: 429,
        origin: "rate_limit",
      },
    });
  });

  it("passes the request and route context through", async () => {
    enforceRateLimitMock.mockResolvedValue(makeResult());
    const request = makeRequest();
    const context = { params: Promise.resolve({ id: "123" }) };
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withRateLimit("api.read", handler);

    await wrapped(request, context);

    expect(handler).toHaveBeenCalledWith(request, context);
  });
});
