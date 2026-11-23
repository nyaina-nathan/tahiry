import { describe, expect, it } from "vitest";
import { getPasswordConfirmationError } from "@/features/auth/utils/password-confirmation";

describe("getPasswordConfirmationError", () => {
  it("accepts matching password values", () => {
    expect(
      getPasswordConfirmationError("new-password", "new-password"),
    ).toBeNull();
  });

  it("reports when the confirmation does not match the new password", () => {
    expect(
      getPasswordConfirmationError("new-password", "different-password"),
    ).toBe("The passwords do not match.");
  });

  it("is case- and whitespace-sensitive", () => {
    expect(getPasswordConfirmationError("Password", "password")).toBe(
      "The passwords do not match.",
    );
    expect(getPasswordConfirmationError("password", "password ")).toBe(
      "The passwords do not match.",
    );
  });

  it("accepts two empty values as matching", () => {
    expect(getPasswordConfirmationError("", "")).toBeNull();
  });
});
