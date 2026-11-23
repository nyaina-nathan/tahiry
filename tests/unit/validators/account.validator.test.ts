import { describe, expect, it } from "vitest";
import {
  validateAccountInput,
  validateAccountPatch,
} from "@/validators/account.validator";
import { expectAppError } from "../helpers/expect-app-error";

describe("validateAccountInput", () => {
  it("trims the account name", () => {
    expect(validateAccountInput({ name: "  Cash  " })).toEqual({
      name: "Cash",
    });
  });

  it("rejects payloads that are not JSON objects", () => {
    for (const payload of [null, undefined, "Cash", 12, []]) {
      expectAppError(() => validateAccountInput(payload), {
        message: "Request body must be a JSON object.",
        status: 400,
        origin: "validation",
      });
    }
  });

  it("requires a name between 1 and 50 characters", () => {
    for (const name of [undefined, "", "   ", 42, "a".repeat(51)]) {
      expectAppError(() => validateAccountInput({ name }), {
        message: "Account name must be between 1 and 50 characters.",
      });
    }
  });

  it("accepts a 50-character name", () => {
    const name = "a".repeat(50);
    expect(validateAccountInput({ name })).toEqual({ name });
  });
});

describe("validateAccountPatch", () => {
  it("trims the patched name", () => {
    expect(validateAccountPatch({ name: "  Savings  " })).toEqual({
      name: "Savings",
    });
  });

  it("rejects payloads that are not JSON objects", () => {
    expectAppError(() => validateAccountPatch(null), {
      message: "Request body must be a JSON object.",
    });
  });

  it("requires at least one account field", () => {
    expectAppError(() => validateAccountPatch({}), {
      message: "At least one account field must be provided.",
    });
  });

  it("rejects an empty patched name", () => {
    expectAppError(() => validateAccountPatch({ name: "  " }), {
      message: "Account name must be between 1 and 50 characters.",
    });
  });
});
