import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
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
  const reminder = await getEmailReminder(await getCurrentUser(request));

  return NextResponse.json(reminder);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getCurrentUser(request);
  const payload = validateEmailReminderInput(await parseJsonPayload(request));
  const reminder = await createEmailReminder(userId, payload);

  return NextResponse.json(reminder, { status: 201 });
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const userId = await getCurrentUser(request);
  const payload = validateEmailReminderPatch(await parseJsonPayload(request));
  const reminder = await updateEmailReminder(userId, payload);

  return NextResponse.json(reminder);
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  await deleteEmailReminder(await getCurrentUser(request));

  return new Response(null, { status: 204 });
});
