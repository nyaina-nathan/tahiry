import { AppError } from "@/libs/errors/app-error";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function validationError(message: string): AppError {
  return new AppError("Bad Request", message, 400, "validation");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateDate(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw validationError(`${fieldName} must be a valid date.`);
  }

  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw validationError(`${fieldName} must use the YYYY-MM-DD format.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    throw validationError(`${fieldName} must be a valid date.`);
  }

  return value;
}

export type ExportInput = {
  from?: string;
  to?: string;
};

export function validateExportInput(payload: unknown): ExportInput {
  if (payload === undefined) {
    return {};
  }

  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const from =
    payload.from === undefined ? undefined : validateDate(payload.from, "from");
  const to =
    payload.to === undefined ? undefined : validateDate(payload.to, "to");

  if (from !== undefined && to !== undefined && from > to) {
    throw validationError("from cannot be after to.");
  }

  return {
    ...(from === undefined ? {} : { from }),
    ...(to === undefined ? {} : { to }),
  };
}
