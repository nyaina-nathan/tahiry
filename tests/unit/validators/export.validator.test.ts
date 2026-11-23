import { describe, expect, it } from "vitest";
import { validateExportInput } from "@/validators/export.validator";
import { expectAppError } from "../helpers/expect-app-error";

describe("validateExportInput", () => {
  it("returns an empty object when no payload is provided", () => {
    expect(validateExportInput(undefined)).toEqual({});
    expect(validateExportInput({})).toEqual({});
  });

  it("accepts a valid date range", () => {
    expect(
      validateExportInput({ from: "2026-01-01", to: "2026-12-31" }),
    ).toEqual({ from: "2026-01-01", to: "2026-12-31" });
  });

  it("accepts a single date boundary", () => {
    expect(validateExportInput({ from: "2026-01-01" })).toEqual({
      from: "2026-01-01",
    });
    expect(validateExportInput({ to: "2026-12-31" })).toEqual({
      to: "2026-12-31",
    });
  });

  it("allows the same day for both boundaries", () => {
    expect(
      validateExportInput({ from: "2026-05-10", to: "2026-05-10" }),
    ).toEqual({ from: "2026-05-10", to: "2026-05-10" });
  });

  it("rejects payloads that are not JSON objects", () => {
    for (const payload of [null, "2026-01-01", 42, []]) {
      expectAppError(() => validateExportInput(payload), {
        message: "Request body must be a JSON object.",
        status: 400,
        origin: "validation",
      });
    }
  });

  it("rejects non-string and malformed dates", () => {
    for (const from of ["01-01-2026", "2026-1-1", "2026-01-01T00:00:00Z"]) {
      expectAppError(() => validateExportInput({ from }), {
        message: "from must use the YYYY-MM-DD format.",
      });
    }

    expectAppError(() => validateExportInput({ from: 20260101 }), {
      message: "from must be a valid date.",
    });
    expectAppError(() => validateExportInput({ to: 20261231 }), {
      message: "to must be a valid date.",
    });
  });

  it("rejects impossible calendar dates", () => {
    expectAppError(() => validateExportInput({ from: "2026-02-30" }), {
      message: "from must be a valid date.",
    });
    expectAppError(() => validateExportInput({ to: "2026-13-01" }), {
      message: "to must be a valid date.",
    });
    expectAppError(() => validateExportInput({ from: "2026-00-10" }), {
      message: "from must be a valid date.",
    });
  });

  it("accepts leap days only in leap years", () => {
    expect(validateExportInput({ from: "2024-02-29" })).toEqual({
      from: "2024-02-29",
    });
    expectAppError(() => validateExportInput({ from: "2026-02-29" }), {
      message: "from must be a valid date.",
    });
  });

  it("rejects a range whose start is after its end", () => {
    expectAppError(
      () => validateExportInput({ from: "2026-12-31", to: "2026-01-01" }),
      { message: "from cannot be after to." },
    );
  });
});
