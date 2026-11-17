import { AppError } from "@/libs/errors/app-error";
import type {
  EmailReminderInput,
  EmailReminderPatch,
} from "@/types/email-reminder.types";

function validationError(message: string): AppError {
  return new AppError("Bad Request", message, 400, "validation");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateDayOfWeek(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > 6
  ) {
    throw validationError("day_of_week must be an integer between 0 and 6.");
  }

  return value;
}

function validateTime(value: unknown): string {
  if (typeof value !== "string") {
    throw validationError("time must be a valid time.");
  }

  const match = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.exec(value);

  if (!match) {
    throw validationError("time must use the HH:mm or HH:mm:ss format.");
  }

  return value.length === 5 ? `${value}:00` : value;
}

export function validateEmailReminderInput(
  payload: unknown,
): EmailReminderInput {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  return {
    day_of_week: validateDayOfWeek(payload.day_of_week),
    time: validateTime(payload.time),
  };
}

export function validateEmailReminderPatch(
  payload: unknown,
): EmailReminderPatch {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  if (!("day_of_week" in payload) && !("time" in payload)) {
    throw validationError(
      "At least one email reminder field must be provided.",
    );
  }

  return {
    ...("day_of_week" in payload
      ? { day_of_week: validateDayOfWeek(payload.day_of_week) }
      : {}),
    ...("time" in payload ? { time: validateTime(payload.time) } : {}),
  };
}
