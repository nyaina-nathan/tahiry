import type { NextRequest } from "next/server";
import { getRateLimiter } from "@/libs/rate-limit/client";
import {
  RATE_LIMIT_POLICIES,
  type RateLimitPolicyName,
  type RateLimitScope,
} from "@/libs/rate-limit/policies";
import { verifyToken } from "@/services/jwt.service";

const SESSION_COOKIE_NAME = "sess_id";
const FAILURE_LOG_INTERVAL_MS = 60_000;

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let lastFailureLogAt = 0;

function logRateLimitFailure(message: string, error?: unknown): void {
  const now = Date.now();

  if (now - lastFailureLogAt < FAILURE_LOG_INTERVAL_MS) return;

  lastFailureLogAt = now;

  if (error === undefined) {
    console.error(`[rate-limit] ${message}`);
    return;
  }

  console.error(`[rate-limit] ${message}`, error);
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstAddress = forwardedFor.split(",")[0]?.trim();

    if (firstAddress) return firstAddress;
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

async function getSessionUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await verifyToken(
      request.cookies.get(SESSION_COOKIE_NAME)?.value,
    );

    return session?.sub ?? null;
  } catch {
    return null;
  }
}

export async function resolveRateLimitIdentifier(
  request: NextRequest,
  scope: RateLimitScope,
): Promise<string> {
  if (scope === "user") {
    const userId = await getSessionUserId(request);

    if (userId) return `user:${userId}`;
  }

  return `ip:${getClientIp(request)}`;
}

export async function enforceRateLimit(
  request: NextRequest,
  policyName: RateLimitPolicyName,
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(policyName);

  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  const policy = RATE_LIMIT_POLICIES[policyName];
  const identifier = await resolveRateLimitIdentifier(request, policy.scope);

  try {
    const result = await limiter.limit(identifier);

    if (result.reason === "timeout") {
      logRateLimitFailure("the rate limit check timed out; allowing request.");
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    logRateLimitFailure("the rate limit check failed; allowing request.", error);

    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
