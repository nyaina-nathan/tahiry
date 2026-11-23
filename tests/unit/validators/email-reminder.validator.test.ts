import { describe, expect, it } from "vitest";
import {
  validateEmailReminderInput,
  validateEmailReminderPatch,
} from "@/validators/email-reminder.validator";
import { expectAppError } from "../helpers/expect-app-error";

describe("validateEmailReminderInput", () => {
  it("accepts an integer weekday and normalizes an HH:mm time", () => {
    expect(
      validateEmailReminderInput({ day_of_week: 0, time: "09:30" }),
    ).toEqual({ day_of_week: 0, time: "09:30:00" });
    expect(
      validateEmailReminderInput({ day_of_week: 6, time: "23:59:59" }),
    ).toEqual({ day_of_week: 6, time: "23:59:59" });
  });

  it("rejects payloads that are not JSON objects", () => {
    expectAppError(() => validateEmailReminderInput(null), {
      message: "Request body must be a JSON object.",
      status: 400,
      origin: "validation",
    });
  });

  it("accepts every weekday from 0 to 6", () => {
    for (let day = 0; day <= 6; day += 1) {
      expect(
        validateEmailReminderInput({ day_of_week: day, time: "08:00" }),
      ).toEqual({ day_of_week: day, time: "08:00:00" });
    }
  });

  it("rejects non-integer or out-of-range weekdays", () => {
    for (const day_of_week of [-1, 7, 1.5, "1", null, undefined]) {
      expectAppError(
        () => validateEmailReminderInput({ day_of_week, time: "09:30" }),
        { message: "day_of_week must be an integer between 0 and 6." },
      );
    }
  });

  it("rejects malformed times", () => {
    for (const time of [
      "9:30",
      "24:00",
      "09:60",
      "09:30:60",
      "09:30:00.000",
      "09-30",
    ]) {
      expectAppError(
        () => validateEmailReminderInput({ day_of_week: 1, time }),
        { message: "time must use the HH:mm or HH:mm:ss format." },
      );
    }
  });

  it("rejects missing or non-string times", () => {
    for (const time of [undefined, 930]) {
      expectAppError(
        () => validateEmailReminderInput({ day_of_week: 1, time }),
        { message: "time must be a valid time." },
      );
    }
  });
});

describe("validateEmailReminderPatch", () => {
  it("accepts a weekday-only patch", () => {
    expect(validateEmailReminderPatch({ day_of_week: 2 })).toEqual({
      day_of_week: 2,
    });
  });

  it("accepts a time-only patch and normalizes it", () => {
    expect(validateEmailReminderPatch({ time: "18:05" })).toEqual({
      time: "18:05:00",
    });
  });

  it("accepts a combined patch", () => {
    expect(
      validateEmailReminderPatch({ day_of_week: 4, time: "07:15:30" }),
    ).toEqual({ day_of_week: 4, time: "07:15:30" });
  });

  it("rejects payloads without any reminder field", () => {
    expectAppError(() => validateEmailReminderPatch({}), {
      message: "At least one email reminder field must be provided.",
    });
  });

  it("rejects invalid patched values", () => {
    expectAppError(() => validateEmailReminderPatch({ day_of_week: 7 }), {
      message: "day_of_week must be an integer between 0 and 6.",
    });
    expectAppError(() => validateEmailReminderPatch({ time: "24:00" }), {
      message: "time must use the HH:mm or HH:mm:ss format.",
    });
  });
});
