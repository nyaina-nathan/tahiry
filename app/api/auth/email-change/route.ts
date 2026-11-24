import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import { requestEmailChange } from "@/services/email-change.service";
import {
  parseJsonPayload,
  validateEmailChangePayload,
} from "@/validators/auth.validator";

export const POST = withErrorHandler(
  withRateLimit("auth.emailChange", async (request: NextRequest) => {
    const userId = await getCurrentUser(request);
    const payload = validateEmailChangePayload(await parseJsonPayload(request));

    await requestEmailChange(userId, payload);

    return new Response(null, { status: 202 });
  }),
);
