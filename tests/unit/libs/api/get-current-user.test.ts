import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { expectAppErrorAsync } from "../../helpers/expect-app-error";

const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));

vi.mock("@/services/jwt.service", () => ({
  verifyToken: verifyTokenMock,
}));

function makeRequest(cookieValue?: string): NextRequest {
  return {
    cookies: {
      get: vi.fn((name: string) =>
        name === "sess_id" && cookieValue !== undefined
          ? { name, value: cookieValue }
          : undefined,
      ),
    },
  } as unknown as NextRequest;
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    verifyTokenMock.mockReset();
  });

  it("returns the subject of a valid session", async () => {
    verifyTokenMock.mockResolvedValue({ sub: "user-123" });

    await expect(getCurrentUser(makeRequest("session-token"))).resolves.toBe(
      "user-123",
    );
    expect(verifyTokenMock).toHaveBeenCalledWith("session-token");
  });

  it("throws a 401 when the session cookie is missing", async () => {
    verifyTokenMock.mockResolvedValue(null);

    await expectAppErrorAsync(getCurrentUser(makeRequest()), {
      title: "Unauthorized",
      message: "Authentication is missing or invalid.",
      status: 401,
      origin: "authentication",
    });
    expect(verifyTokenMock).toHaveBeenCalledWith(undefined);
  });

  it("throws a 401 when the token cannot be verified", async () => {
    verifyTokenMock.mockResolvedValue(null);

    await expectAppErrorAsync(getCurrentUser(makeRequest("expired-token")), {
      title: "Unauthorized",
      message: "Authentication is missing or invalid.",
      status: 401,
    });
  });

  it("throws a 401 when the token payload has no subject", async () => {
    verifyTokenMock.mockResolvedValue({} as { sub: string });

    await expectAppErrorAsync(getCurrentUser(makeRequest("token")), {
      title: "Unauthorized",
      status: 401,
    });
  });
});
