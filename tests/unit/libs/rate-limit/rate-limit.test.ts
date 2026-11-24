import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRateLimiterMock, verifyTokenMock } = vi.hoisted(() => ({
  getRateLimiterMock: vi.fn(),
  verifyTokenMock: vi.fn(),
}));

vi.mock("@/libs/rate-limit/client", () => ({
  getRateLimiter: getRateLimiterMock,
}));

vi.mock("@/services/jwt.service", () => ({
  verifyToken: verifyTokenMock,
}));

import {
  enforceRateLimit,
  getClientIp,
  resolveRateLimitIdentifier,
} from "@/libs/rate-limit/rate-limit";

function makeRequest(
  headers: Record<string, string> = {},
  sessionToken?: string,
): NextRequest {
  return {
    headers: new Headers(headers),
    cookies: {
      get: (name: string) =>
        name === "sess_id" && sessionToken
          ? { name, value: sessionToken }
          : undefined,
    },
  } as unknown as NextRequest;
}

describe("getClientIp", () => {
  it("uses the first address from x-forwarded-for", () => {
    const request = makeRequest({
      "x-forwarded-for": "203.0.113.5, 10.0.0.1",
    });

    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    const request = makeRequest({ "x-real-ip": "198.51.100.9" });

    expect(getClientIp(request)).toBe("198.51.100.9");
  });

  it("falls back to a stable placeholder when no address is present", () => {
    expect(getClientIp(makeRequest())).toBe("unknown");
  });
});

describe("resolveRateLimitIdentifier", () => {
  beforeEach(() => {
    getRateLimiterMock.mockReset();
    verifyTokenMock.mockReset();
  });

  it("keys user-scoped policies by the session user", async () => {
    verifyTokenMock.mockResolvedValue({ sub: "user-123" });

    const identifier = await resolveRateLimitIdentifier(
      makeRequest({ "x-forwarded-for": "203.0.113.5" }, "token"),
      "user",
    );

    expect(identifier).toBe("user:user-123");
  });

  it("falls back to the IP when the session is missing", async () => {
    verifyTokenMock.mockResolvedValue(null);

    const identifier = await resolveRateLimitIdentifier(
      makeRequest({ "x-forwarded-for": "203.0.113.5" }),
      "user",
    );

    expect(identifier).toBe("ip:203.0.113.5");
  });

  it("always keys ip-scoped policies by the IP", async () => {
    const identifier = await resolveRateLimitIdentifier(
      makeRequest({ "x-forwarded-for": "203.0.113.5" }, "token"),
      "ip",
    );

    expect(identifier).toBe("ip:203.0.113.5");
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });
});

describe("enforceRateLimit", () => {
  beforeEach(() => {
    getRateLimiterMock.mockReset();
    verifyTokenMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("allows the request when rate limiting is not configured", async () => {
    getRateLimiterMock.mockReturnValue(null);

    const result = await enforceRateLimit(makeRequest(), "api.read");

    expect(result).toEqual({
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    });
  });

  it("returns the limiter result", async () => {
    const reset = Date.now() + 60_000;
    const limit = vi.fn().mockResolvedValue({
      success: false,
      limit: 120,
      remaining: 0,
      reset,
      pending: Promise.resolve(),
    });
    getRateLimiterMock.mockReturnValue({ limit });
    verifyTokenMock.mockResolvedValue({ sub: "user-123" });

    const result = await enforceRateLimit(makeRequest(), "api.read");

    expect(limit).toHaveBeenCalledWith("user:user-123");
    expect(result).toEqual({
      success: false,
      limit: 120,
      remaining: 0,
      reset,
    });
  });

  it("fails open when the limiter throws", async () => {
    getRateLimiterMock.mockReturnValue({
      limit: vi.fn().mockRejectedValue(new Error("Redis is down")),
    });
    verifyTokenMock.mockResolvedValue(null);

    const result = await enforceRateLimit(makeRequest(), "api.read");

    expect(result.success).toBe(true);
    expect(result.limit).toBe(0);
  });
});
