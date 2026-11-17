import { prisma } from "@/libs/db/prisma";
import {
  AppError,
  isUniqueConstraintError,
} from "@/libs/errors/app-error";
import type {
  EmailReminder,
  EmailReminderInput,
  EmailReminderPatch,
} from "@/types/email-reminder.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const emailReminderSelect = {
  id: true,
  id_user: true,
  day_of_week: true,
  time: true,
} as const;

function unauthorizedError(): AppError {
  return new AppError(
    "Unauthorized",
    "Authentication is missing or invalid.",
    401,
    "authentication",
  );
}

function notFoundError(): AppError {
  return new AppError(
    "Not Found",
    "Email reminder not found.",
    404,
    "email-reminder",
  );
}

function conflictError(): AppError {
  return new AppError(
    "Conflict",
    "An email reminder already exists for this user.",
    409,
    "email-reminder",
  );
}

function requireUserId(userId: string | null): string {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw unauthorizedError();
  }

  return userId;
}

function toEmailReminder(reminder: {
  id: string;
  id_user: string;
  day_of_week: number;
  time: Date;
}): EmailReminder {
  return {
    id: reminder.id,
    id_user: reminder.id_user,
    day_of_week: reminder.day_of_week,
    time: reminder.time.toISOString().slice(11, 19),
  };
}

export async function getEmailReminder(
  userIdHeader: string | null,
): Promise<EmailReminder> {
  const userId = requireUserId(userIdHeader);
  const reminder = await prisma.weekly_reminder.findUnique({
    where: { id_user: userId },
    select: emailReminderSelect,
  });

  if (!reminder) {
    throw notFoundError();
  }

  return toEmailReminder(reminder);
}

export async function createEmailReminder(
  userIdHeader: string | null,
  payload: EmailReminderInput,
): Promise<EmailReminder> {
  const userId = requireUserId(userIdHeader);
  const existing = await prisma.weekly_reminder.findUnique({
    where: { id_user: userId },
    select: { id: true },
  });

  if (existing) {
    throw conflictError();
  }

  try {
    const reminder = await prisma.weekly_reminder.create({
      data: {
        id_user: userId,
        day_of_week: payload.day_of_week,
        time: `1970-01-01T${payload.time}Z`,
      },
      select: emailReminderSelect,
    });

    return toEmailReminder(reminder);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw conflictError();
    }

    throw error;
  }
}

export async function updateEmailReminder(
  userIdHeader: string | null,
  payload: EmailReminderPatch,
): Promise<EmailReminder> {
  const userId = requireUserId(userIdHeader);
  const reminder = await prisma.weekly_reminder.findUnique({
    where: { id_user: userId },
    select: { id: true },
  });

  if (!reminder) {
    throw notFoundError();
  }

  const updated = await prisma.weekly_reminder.update({
    where: { id: reminder.id },
    data: {
      ...(payload.day_of_week === undefined
        ? {}
        : { day_of_week: payload.day_of_week }),
      ...(payload.time === undefined
        ? {}
        : { time: `1970-01-01T${payload.time}Z` }),
    },
    select: emailReminderSelect,
  });

  return toEmailReminder(updated);
}

export async function deleteEmailReminder(
  userIdHeader: string | null,
): Promise<void> {
  const userId = requireUserId(userIdHeader);
  const result = await prisma.weekly_reminder.deleteMany({
    where: { id_user: userId },
  });

  if (result.count === 0) {
    throw notFoundError();
  }
}
