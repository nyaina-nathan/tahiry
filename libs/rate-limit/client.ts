import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  RATE_LIMIT_POLICIES,
  type RateLimitPolicyName,
} from "@/libs/rate-limit/policies";

const REDIS_URL_ENV = "UPSTASH_REDIS_REST_URL";
const REDIS_TOKEN_ENV = "UPSTASH_REDIS_REST_TOKEN";
const RATE_LIMIT_PREFIX = "pennywise:ratelimit";
const RATE_LIMIT_TIMEOUT_MS = 1_000;

let redis: Redis | null | undefined;
let warnedAboutMissingConfig = false;

function warnAboutMissingConfig(): void {
  if (warnedAboutMissingConfig) return;

  warnedAboutMissingConfig = true;
  console.warn(
    `[rate-limit] ${REDIS_URL_ENV} or ${REDIS_TOKEN_ENV} is not configured. Rate limiting is disabled.`,
  );
}

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;

  const url = process.env[REDIS_URL_ENV];
  const token = process.env[REDIS_TOKEN_ENV];

  if (!url || !token) {
    warnAboutMissingConfig();
    redis = null;
    return null;
  }

  redis = new Redis({
    url,
    token,
    retry: false,
    signal: () => AbortSignal.timeout(RATE_LIMIT_TIMEOUT_MS),
  });

  return redis;
}

const limiters = new Map<RateLimitPolicyName, Ratelimit>();

export function getRateLimiter(
  policyName: RateLimitPolicyName,
): Ratelimit | null {
  const existing = limiters.get(policyName);

  if (existing) return existing;

  const redisClient = getRedis();

  if (!redisClient) return null;

  const policy = RATE_LIMIT_POLICIES[policyName];
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: `${RATE_LIMIT_PREFIX}:${policyName}`,
    timeout: RATE_LIMIT_TIMEOUT_MS,
    ephemeralCache: new Map(),
  });

  limiters.set(policyName, limiter);

  return limiter;
}
