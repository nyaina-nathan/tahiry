import { describe, expect, it } from "vitest";
import {
  getPasswordResetFailure,
  removePasswordResetFailureFromUrl,
} from "@/features/auth/utils/password-reset-feedback";

describe("getPasswordResetFailure", () => {
  it("recognizes only the exact true flag", () => {
    expect(getPasswordResetFailure("?isPasswordResetFail=true")).toBe(true);
    expect(getPasswordResetFailure("isPasswordResetFail=true")).toBe(true);
  });

  it("ignores false, missing, and differently-cased values", () => {
    expect(getPasswordResetFailure("?isPasswordResetFail=false")).toBe(false);
    expect(getPasswordResetFailure("?isPasswordResetFail=1")).toBe(false);
    expect(getPasswordResetFailure("?isPasswordResetFail=TRUE")).toBe(false);
    expect(getPasswordResetFailure("")).toBe(false);
  });
});

describe("removePasswordResetFailureFromUrl", () => {
  it("removes the failure flag while preserving other URL state", () => {
    expect(
      removePasswordResetFailureFromUrl(
        "https://example.com/login?next=%2Faccounts&isPasswordResetFail=true#form",
      ),
    ).toBe("/login?next=%2Faccounts#form");
  });

  it("keeps the query string intact when only the flag was present", () => {
    expect(
      removePasswordResetFailureFromUrl(
        "https://example.com/login?isPasswordResetFail=true",
      ),
    ).toBe("/login");
  });

  it("leaves URLs without the flag unchanged", () => {
    expect(
      removePasswordResetFailureFromUrl("https://example.com/login?next=%2F#top"),
    ).toBe("/login?next=%2F#top");
  });
});
