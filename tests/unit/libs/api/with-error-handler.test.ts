import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "@/libs/errors/app-error";
import { withErrorHandler } from "@/libs/api/with-error-handler";

function makeRequest(): NextRequest {
  return {} as NextRequest;
}

describe("withErrorHandler", () => {
  it("passes successful responses through unchanged", async () => {
    const response = Response.json({ ok: true }, { status: 201 });
    const handler = withErrorHandler(async () => response);

    const result = await handler(makeRequest(), {});

    expect(result).toBe(response);
    expect(result.status).toBe(201);
  });

  it("maps an AppError to its HTTP response", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withErrorHandler(async () => {
      throw new AppError("Bad Request", "Invalid input.", 400, "validation");
    });

    const response = await handler(makeRequest(), {});

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        title: "Bad Request",
        message: "Invalid input.",
        status: 400,
        origin: "validation",
      },
    });
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("hides unexpected errors behind a generic 500 response", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withErrorHandler(async () => {
      throw new Error("Database connection leaked");
    });

    const response = await handler(makeRequest(), {});

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        title: "Internal Server Error",
        message: "An unexpected error occurred.",
        status: 500,
        origin: "system",
      },
    });
  });

  it("forwards the request and route context to the handler", async () => {
    const request = makeRequest();
    const context = { params: Promise.resolve({ id: "123" }) };
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withErrorHandler(handler);

    await wrapped(request, context);

    expect(handler).toHaveBeenCalledWith(request, context);
  });
});
