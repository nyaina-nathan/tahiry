import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import {
  parseJsonPayload,
  validatePasswordResetPayload,
} from "@/validators/auth.validator";
import { requestPasswordReset } from "@/services/password-reset.service";

export const POST = withErrorHandler(
  withRateLimit("auth.passwordReset", async (request) => {
    const payload = validatePasswordResetPayload(
      await parseJsonPayload(request),
    );
    await requestPasswordReset(payload);

    return new Response(null, { status: 202 });
  }),
);
