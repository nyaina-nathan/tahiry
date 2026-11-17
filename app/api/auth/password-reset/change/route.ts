import { withErrorHandler } from "@/libs/api/with-error-handler";
import { changePassword } from "@/services/password-reset-change.service";
import {
  parseJsonPayload,
  validatePasswordResetChangePayload,
} from "@/validators/auth.validator";

export const POST = withErrorHandler(async (request) => {
  const payload = validatePasswordResetChangePayload(
    await parseJsonPayload(request),
  );
  await changePassword(payload);

  return new Response(null, { status: 204 });
});
