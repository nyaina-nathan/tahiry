import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import {
  createEmailReminder,
  deleteEmailReminder,
  getEmailReminder,
  updateEmailReminder,
} from "@/services/email-reminder.service";
import { parseJsonPayload } from "@/validators/auth.validator";
import {
  validateEmailReminderInput,
  validateEmailReminderPatch,
} from "@/validators/email-reminder.validator";

export const GET = withErrorHandler(
  withRateLimit("api.read", async (request: NextRequest) => {
    const reminder = await getEmailReminder(await getCurrentUser(request));

    return NextResponse.json(reminder);
  }),
);

export const POST = withErrorHandler(
  withRateLimit("api.write", async (request: NextRequest) => {
    const userId = await getCurrentUser(request);
    const payload = validateEmailReminderInput(
      await parseJsonPayload(request),
    );
    const reminder = await createEmailReminder(userId, payload);

    return NextResponse.json(reminder, { status: 201 });
  }),
);

export const PATCH = withErrorHandler(
  withRateLimit("api.write", async (request: NextRequest) => {
    const userId = await getCurrentUser(request);
    const payload = validateEmailReminderPatch(
      await parseJsonPayload(request),
    );
    const reminder = await updateEmailReminder(userId, payload);

    return NextResponse.json(reminder);
  }),
);

export const DELETE = withErrorHandler(
  withRateLimit("api.write", async (request: NextRequest) => {
    await deleteEmailReminder(await getCurrentUser(request));

    return new Response(null, { status: 204 });
  }),
);
