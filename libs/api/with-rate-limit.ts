import type { RateLimitPolicyName } from "@/libs/rate-limit/policies";
import { enforceRateLimit } from "@/libs/rate-limit/rate-limit";
import {
  applyRateLimitHeaders,
  rateLimitedResponse,
} from "@/libs/rate-limit/response";
import type {
  RouteContext,
  RouteHandler,
} from "@/libs/api/with-error-handler";

export function withRateLimit<TContext extends RouteContext = RouteContext>(
  policy: RateLimitPolicyName,
  handler: RouteHandler<TContext>,
): RouteHandler<TContext> {
  return async (request, context) => {
    const result = await enforceRateLimit(request, policy);

    if (!result.success) {
      return rateLimitedResponse(result);
    }

    const response = await handler(request, context);

    return applyRateLimitHeaders(response, result);
  };
}
