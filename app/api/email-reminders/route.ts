import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
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

export const GET = withErrorHandler(async (request: NextRequest) => {
  const reminder = await getEmailReminder(request.headers.get("X-User-Id"));

  return NextResponse.json(reminder);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const payload = validateEmailReminderInput(await parseJsonPayload(request));
  const reminder = await createEmailReminder(
    request.headers.get("X-User-Id"),
    payload,
  );

  return NextResponse.json(reminder, { status: 201 });
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const payload = validateEmailReminderPatch(await parseJsonPayload(request));
  const reminder = await updateEmailReminder(
    request.headers.get("X-User-Id"),
    payload,
  );

  return NextResponse.json(reminder);
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  await deleteEmailReminder(request.headers.get("X-User-Id"));

  return new Response(null, { status: 204 });
});
