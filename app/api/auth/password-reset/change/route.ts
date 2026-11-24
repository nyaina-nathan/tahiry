import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import { changePassword } from "@/services/password-reset-change.service";
import {
  parseJsonPayload,
  validatePasswordResetChangePayload,
} from "@/validators/auth.validator";

export const POST = withErrorHandler(
  withRateLimit("auth.passwordResetChange", async (request) => {
    const payload = validatePasswordResetChangePayload(
      await parseJsonPayload(request),
    );
    await changePassword(payload);

    return new Response(null, { status: 204 });
  }),
);
