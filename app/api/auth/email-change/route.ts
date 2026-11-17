import type { NextRequest } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { requestEmailChange } from "@/services/email-change.service";
import {
  parseJsonPayload,
  validateEmailChangePayload,
} from "@/validators/auth.validator";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const payload = validateEmailChangePayload(await parseJsonPayload(request));

  await requestEmailChange(
    request.headers.get("X-User-ID"),
    payload,
  );

  return new Response(null, { status: 202 });
});
