import type { RateLimitResult } from "@/libs/rate-limit/rate-limit";

const RATE_LIMIT_TITLE = "Too Many Requests";
const RATE_LIMIT_MESSAGE = "Too many requests. Please try again later.";

function applyHeaders(headers: Headers, result: RateLimitResult): void {
  if (result.limit <= 0) return;

  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(result.reset / 1000)));
}

export function applyRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
): Response {
  applyHeaders(response.headers, result);

  return response;
}

export function rateLimitedResponse(result: RateLimitResult): Response {
  const response = Response.json(
    {
      error: {
        title: RATE_LIMIT_TITLE,
        message: RATE_LIMIT_MESSAGE,
        status: 429,
        origin: "rate_limit",
      },
    },
    { status: 429 },
  );

  applyHeaders(response.headers, result);

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  response.headers.set("Retry-After", String(retryAfterSeconds));

  return response;
}
