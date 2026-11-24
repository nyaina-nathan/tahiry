import type { Duration } from "@upstash/ratelimit";

export type RateLimitPolicyName =
  | "auth.register"
  | "auth.login"
  | "auth.logout"
  | "auth.passwordReset"
  | "auth.passwordResetChange"
  | "auth.passwordConfirm"
  | "auth.emailChange"
  | "auth.emailConfirm"
  | "api.read"
  | "api.write"
  | "api.transfer"
  | "api.export";

export type RateLimitScope = "ip" | "user";

export type RateLimitPolicy = {
  /** Maximum number of requests allowed inside the window. */
  limit: number;
  /** Sliding window duration, for example `"15 m"`. */
  window: Duration;
  /** Whether the counter is keyed by client IP or by the authenticated user. */
  scope: RateLimitScope;
};

export const RATE_LIMIT_POLICIES: Record<
  RateLimitPolicyName,
  RateLimitPolicy
> = {
  "auth.register": { limit: 5, window: "1 h", scope: "ip" },
  "auth.login": { limit: 10, window: "15 m", scope: "ip" },
  "auth.logout": { limit: 60, window: "1 m", scope: "ip" },
  "auth.passwordReset": { limit: 5, window: "15 m", scope: "ip" },
  "auth.passwordResetChange": { limit: 5, window: "15 m", scope: "ip" },
  "auth.passwordConfirm": { limit: 20, window: "15 m", scope: "ip" },
  "auth.emailChange": { limit: 5, window: "1 h", scope: "user" },
  "auth.emailConfirm": { limit: 20, window: "15 m", scope: "ip" },
  "api.read": { limit: 120, window: "1 m", scope: "user" },
  "api.write": { limit: 60, window: "1 m", scope: "user" },
  "api.transfer": { limit: 30, window: "1 m", scope: "user" },
  "api.export": { limit: 10, window: "1 h", scope: "user" },
};
