import { AppError } from "@/libs/errors/app-error";
import type {
  MovementFilters,
  MovementInput,
  MovementPatch,
  MovementType,
} from "@/types/money-movement.types";
import type { TransferInput } from "@/types/transfer.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const AMOUNT_PATTERN = /^-?\d{1,8}(?:\.\d{1,2})?$/;

function validationError(message: string): AppError {
  return new AppError("Bad Request", message, 400, "validation");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateDateParts(
  year: number,
  month: number,
  day: number,
): boolean {
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

export function validateUuid(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw validationError(`${fieldName} must be a valid UUID.`);
  }

  return value;
}

export function validateMovementType(value: unknown): MovementType {
  if (value !== "EXPENSE" && value !== "INCOME" && value !== "TRANSFERT") {
    throw validationError(
      "Movement type must be EXPENSE, INCOME or TRANSFERT.",
    );
  }

  return value;
}

function rejectTransfert(movementType: MovementType): MovementType {
  if (movementType === "TRANSFERT") {
    throw validationError(
      "Movement type TRANSFERT can only be created through the transfer endpoint.",
    );
  }

  return movementType;
}

function validateTitle(value: unknown): string {
  const title = typeof value === "string" ? value.trim() : undefined;

  if (!title || title.length > 255) {
    throw validationError("Title must be between 1 and 255 characters.");
  }

  return title;
}

function validateAmount(value: unknown): string {
  if (typeof value !== "string" || !AMOUNT_PATTERN.test(value)) {
    throw validationError(
      "Amount must be a decimal string with up to 8 integer digits and 2 fractional digits.",
    );
  }

  return value;
}

function validateDate(value: unknown): string {
  if (typeof value !== "string") {
    throw validationError("logged_for must be a valid date.");
  }

  const match = DATE_PATTERN.exec(value);
  if (
    !match ||
    !validateDateParts(Number(match[1]), Number(match[2]), Number(match[3]))
  ) {
    throw validationError("logged_for must use the YYYY-MM-DD format.");
  }

  return value;
}

function validateDateTime(value: unknown): string {
  if (typeof value !== "string") {
    throw validationError("logged_at must be a valid date-time.");
  }

  const match = DATE_TIME_PATTERN.exec(value);
  if (!match) {
    throw validationError(
      "logged_at must use an RFC3339 date-time with a timezone.",
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const timezone = match[7];
  const timezoneMatch = timezone === "Z" ? null : /[+-](\d{2}):(\d{2})/.exec(timezone);

  if (
    !validateDateParts(year, month, day) ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    (timezoneMatch &&
      (Number(timezoneMatch[1]) > 23 || Number(timezoneMatch[2]) > 59)) ||
    Number.isNaN(new Date(value).getTime())
  ) {
    throw validationError("logged_at must be a valid RFC3339 date-time.");
  }

  return value;
}

function validateDescription(value: unknown): string | null {
  if (value !== null && typeof value !== "string") {
    throw validationError("Description must be a string or null.");
  }

  return value;
}

function validateCategoryId(value: unknown): string | null {
  return value === null ? null : validateUuid(value, "id_category");
}

export function validateMovementInput(payload: unknown): MovementInput {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const movementType =
    payload.movement_type === undefined
      ? undefined
      : rejectTransfert(validateMovementType(payload.movement_type));
  const idCategory =
    payload.id_category === undefined
      ? undefined
      : validateCategoryId(payload.id_category);
  const description =
    payload.description === undefined
      ? undefined
      : validateDescription(payload.description);
  const loggedFor =
    payload.logged_for === undefined
      ? undefined
      : payload.logged_for === null
        ? null
        : validateDate(payload.logged_for);
  const loggedAt =
    payload.logged_at === undefined
      ? undefined
      : payload.logged_at === null
        ? null
        : validateDateTime(payload.logged_at);

  return {
    ...(idCategory === undefined ? {} : { id_category: idCategory }),
    ...(movementType === undefined ? {} : { movement_type: movementType }),
    title: validateTitle(payload.title),
    ...(description === undefined ? {} : { description }),
    amount: validateAmount(payload.amount),
    ...(loggedFor === undefined ? {} : { logged_for: loggedFor }),
    ...(loggedAt === undefined ? {} : { logged_at: loggedAt }),
  };
}

export function validateMovementPatch(payload: unknown): MovementPatch {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const fields = [
    "id_category",
    "movement_type",
    "title",
    "description",
    "amount",
    "logged_for",
    "logged_at",
  ];

  if (!fields.some((field) => field in payload)) {
    throw validationError("At least one movement field must be provided.");
  }

  const patch: MovementPatch = {};

  if ("id_category" in payload) {
    patch.id_category = validateCategoryId(payload.id_category);
  }

  if ("movement_type" in payload) {
    patch.movement_type = rejectTransfert(
      validateMovementType(payload.movement_type),
    );
  }

  if ("title" in payload) {
    patch.title = validateTitle(payload.title);
  }

  if ("description" in payload) {
    patch.description = validateDescription(payload.description);
  }

  if ("amount" in payload) {
    patch.amount = validateAmount(payload.amount);
  }

  if ("logged_for" in payload) {
    patch.logged_for =
      payload.logged_for === null
        ? null
        : validateDate(payload.logged_for);
  }

  if ("logged_at" in payload) {
    patch.logged_at =
      payload.logged_at === null
        ? null
        : validateDateTime(payload.logged_at);
  }

  return patch;
}

function parsePositiveInteger(
  value: string | null,
  fieldName: string,
  defaultValue: number,
  maximum?: number,
): number {
  if (value === null) {
    return defaultValue;
  }

  if (!/^\d+$/.test(value)) {
    throw validationError(`${fieldName} must be a positive integer.`);
  }

  const parsed = Number(value);
  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1 ||
    (maximum !== undefined && parsed > maximum)
  ) {
    throw validationError(
      maximum === undefined
        ? `${fieldName} must be at least 1.`
        : `${fieldName} must be between 1 and ${maximum}.`,
    );
  }

  return parsed;
}

const POSITIVE_AMOUNT_PATTERN = /^\d{1,8}(?:\.\d{1,2})?$/;

function validatePositiveAmount(value: unknown): string {
  if (typeof value !== "string" || !POSITIVE_AMOUNT_PATTERN.test(value)) {
    throw validationError(
      "Amount must be a positive decimal string with up to 8 integer digits and 2 fractional digits.",
    );
  }

  if (Number(value) <= 0) {
    throw validationError("Amount must be greater than 0.");
  }

  return value;
}

export function validateTransferInput(payload: unknown): TransferInput {
  if (!isRecord(payload)) {
    throw validationError("Request body must be a JSON object.");
  }

  const sourceId = validateUuid(payload.id_account_source, "id_account_source");
  const destinationId = validateUuid(payload.id_account, "id_account");

  if (sourceId.toLowerCase() === destinationId.toLowerCase()) {
    throw validationError("Source and destination accounts must be different.");
  }

  const title =
    payload.title === undefined ? undefined : validateTitle(payload.title);
  const description =
    payload.description === undefined
      ? undefined
      : validateDescription(payload.description);
  const loggedFor =
    payload.logged_for === undefined
      ? undefined
      : payload.logged_for === null
        ? null
        : validateDate(payload.logged_for);
  const loggedAt =
    payload.logged_at === undefined
      ? undefined
      : payload.logged_at === null
        ? null
        : validateDateTime(payload.logged_at);

  return {
    id_account_source: sourceId,
    id_account: destinationId,
    amount: validatePositiveAmount(payload.amount),
    ...(title === undefined ? {} : { title }),
    ...(description === undefined ? {} : { description }),
    ...(loggedFor === undefined ? {} : { logged_for: loggedFor }),
    ...(loggedAt === undefined ? {} : { logged_at: loggedAt }),
  };
}

export function parseMovementFilters(
  searchParams: URLSearchParams,
): MovementFilters {
  const movementTypeValue = searchParams.get("movement_type");
  const categoryIdValue = searchParams.get("id_category");
  const loggedForFromValue = searchParams.get("logged_for_from");
  const loggedForToValue = searchParams.get("logged_for_to");
  const movementType =
    movementTypeValue === null
      ? undefined
      : validateMovementType(movementTypeValue);
  const categoryId =
    categoryIdValue === null
      ? undefined
      : validateUuid(categoryIdValue, "id_category");
  const loggedForFrom =
    loggedForFromValue === null
      ? undefined
      : validateDate(loggedForFromValue);
  const loggedForTo =
    loggedForToValue === null ? undefined : validateDate(loggedForToValue);

  if (loggedForFrom && loggedForTo && loggedForFrom > loggedForTo) {
    throw validationError("logged_for_from cannot be after logged_for_to.");
  }

  return {
    ...(movementType === undefined ? {} : { movementType }),
    ...(categoryId === undefined ? {} : { categoryId }),
    ...(loggedForFrom === undefined ? {} : { loggedForFrom }),
    ...(loggedForTo === undefined ? {} : { loggedForTo }),
    page: parsePositiveInteger(searchParams.get("page"), "page", 1),
    pageSize: parsePositiveInteger(
      searchParams.get("page_size"),
      "page_size",
      25,
      100,
    ),
  };
}
