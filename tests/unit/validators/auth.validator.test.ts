import { describe, expect, it } from "vitest";
import {
  parseJsonPayload,
  parseOptionalJsonPayload,
  validateEmailChangePayload,
  validateLoginPayload,
  validatePasswordResetChangePayload,
  validatePasswordResetPayload,
  validateRegisterPayload,
  validateUserPatchPayload,
} from "@/validators/auth.validator";
import { expectAppError, expectAppErrorAsync } from "../helpers/expect-app-error";

function jsonRequest(body: string): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("validateRegisterPayload", () => {
  it("trims username and currency and normalizes the email", () => {
    expect(
      validateRegisterPayload({
        username: "  Ada  ",
        email: "  ADA@EXAMPLE.COM ",
        password: "a-secure-password",
        currency: " EUR ",
      }),
    ).toEqual({
      username: "Ada",
      email: "ada@example.com",
      password: "a-secure-password",
      currency: "EUR",
    });
  });

  it("rejects payloads that are not JSON objects", () => {
    for (const payload of [null, undefined, "text", 42, []]) {
      expectAppError(() => validateRegisterPayload(payload), {
        message: "Request body must be a JSON object.",
        status: 400,
        origin: "validation",
      });
    }
  });

  it("requires a username between 1 and 255 characters", () => {
    const base = {
      email: "ada@example.com",
      password: "a-secure-password",
      currency: "EUR",
    };

    expectAppError(
      () => validateRegisterPayload({ ...base, username: "   " }),
      { message: "Username must be between 1 and 255 characters." },
    );
    expectAppError(
      () => validateRegisterPayload({ ...base, username: "a".repeat(256) }),
      { message: "Username must be between 1 and 255 characters." },
    );
  });

  it("requires an email address", () => {
    expectAppError(
      () =>
        validateRegisterPayload({
          username: "Ada",
          password: "a-secure-password",
          currency: "EUR",
        }),
      { message: "Email is required." },
    );
  });

  it("rejects malformed and overlong email addresses", () => {
    expectAppError(
      () =>
        validateRegisterPayload({
          username: "Ada",
          email: "not-an-email",
          password: "a-secure-password",
          currency: "EUR",
        }),
      { message: "Email must be a valid email address." },
    );
    expectAppError(
      () =>
        validateRegisterPayload({
          username: "Ada",
          email: `${"a".repeat(250)}@example.com`,
          password: "a-secure-password",
          currency: "EUR",
        }),
      { message: "Email must be a valid email address." },
    );
  });

  it("enforces the 8 to 72 character password boundary", () => {
    const payload = (password: string) => ({
      username: "Ada",
      email: "ada@example.com",
      password,
      currency: "EUR",
    });

    expect(validateRegisterPayload(payload("a".repeat(8))).password).toBe(
      "a".repeat(8),
    );
    expect(validateRegisterPayload(payload("a".repeat(72))).password).toBe(
      "a".repeat(72),
    );

    for (const password of ["short", "a".repeat(73)]) {
      expectAppError(() => validateRegisterPayload(payload(password)), {
        message: "Password must be between 8 and 72 characters.",
      });
    }
  });

  it("requires a currency between 1 and 20 characters", () => {
    const payload = (currency: string) => ({
      username: "Ada",
      email: "ada@example.com",
      password: "a-secure-password",
      currency,
    });

    expectAppError(() => validateRegisterPayload(payload("   ")), {
      message: "Currency must be between 1 and 20 characters.",
    });
    expectAppError(() => validateRegisterPayload(payload("a".repeat(21))), {
      message: "Currency must be between 1 and 20 characters.",
    });
  });
});

describe("validateLoginPayload", () => {
  it("trims and normalizes the credentials", () => {
    expect(
      validateLoginPayload({
        email: "  ADA@EXAMPLE.COM ",
        password: "a-secure-password",
      }),
    ).toEqual({
      email: "ada@example.com",
      password: "a-secure-password",
    });
  });

  it("requires both credentials", () => {
    expectAppError(() => validateLoginPayload({ password: "secret" }), {
      message: "Email is required.",
    });
    expectAppError(() => validateLoginPayload({ email: "ada@example.com" }), {
      message: "Password is required.",
    });
  });

  it("rejects invalid email addresses", () => {
    expectAppError(
      () =>
        validateLoginPayload({
          email: "not-an-email",
          password: "a-secure-password",
        }),
      { message: "Email must be a valid email address." },
    );
  });
});

describe("validateEmailChangePayload", () => {
  it("normalizes the new email and keeps the current password", () => {
    expect(
      validateEmailChangePayload({
        newEmail: "  ADA@EXAMPLE.COM ",
        currentPassword: "correct horse battery staple",
      }),
    ).toEqual({
      newEmail: "ada@example.com",
      currentPassword: "correct horse battery staple",
    });
  });

  it("rejects unsupported fields", () => {
    expectAppError(
      () =>
        validateEmailChangePayload({
          newEmail: "ada@example.com",
          currentPassword: "a-secure-password",
          userId: "untrusted",
        }),
      { message: "Only newEmail and currentPassword are allowed." },
    );
  });

  it("requires a new email address", () => {
    expectAppError(
      () => validateEmailChangePayload({ currentPassword: "a-secure-password" }),
      { message: "New email is required." },
    );
  });

  it("enforces the current password boundary", () => {
    expectAppError(
      () =>
        validateEmailChangePayload({
          newEmail: "ada@example.com",
          currentPassword: "short",
        }),
      { message: "Current password must be between 8 and 72 characters." },
    );
    expectAppError(
      () =>
        validateEmailChangePayload({
          newEmail: "ada@example.com",
          currentPassword: "a".repeat(73),
        }),
      { message: "Current password must be between 8 and 72 characters." },
    );
  });
});

describe("validatePasswordResetPayload", () => {
  it("normalizes the email address", () => {
    expect(
      validatePasswordResetPayload({ email: "  ADA@EXAMPLE.COM " }),
    ).toEqual({ email: "ada@example.com" });
  });

  it("rejects unsupported fields", () => {
    expectAppError(
      () =>
        validatePasswordResetPayload({
          email: "ada@example.com",
          userId: "untrusted",
        }),
      { message: "Only email is allowed." },
    );
  });

  it("requires a valid email address", () => {
    expectAppError(() => validatePasswordResetPayload({}), {
      message: "Email is required.",
    });
    expectAppError(
      () => validatePasswordResetPayload({ email: "not-an-email" }),
      { message: "Email must be a valid email address." },
    );
  });
});

describe("validatePasswordResetChangePayload", () => {
  it("accepts a 64-character lowercase hexadecimal token", () => {
    expect(
      validatePasswordResetChangePayload({
        token: "a".repeat(64),
        newPassword: "a-secure-password",
      }),
    ).toEqual({
      token: "a".repeat(64),
      newPassword: "a-secure-password",
    });
  });

  it("rejects unsupported fields", () => {
    expectAppError(
      () =>
        validatePasswordResetChangePayload({
          token: "a".repeat(64),
          newPassword: "a-secure-password",
          userId: "untrusted",
        }),
      { message: "Only token and newPassword are allowed." },
    );
  });

  it("rejects malformed reset tokens", () => {
    for (const token of [
      "not-a-token",
      "a".repeat(63),
      "A".repeat(64),
      "g".repeat(64),
    ]) {
      expectAppError(
        () =>
          validatePasswordResetChangePayload({
            token,
            newPassword: "a-secure-password",
          }),
        { message: "Reset token is invalid." },
      );
    }
  });

  it("enforces the new password boundary", () => {
    for (const newPassword of ["short", "a".repeat(73)]) {
      expectAppError(
        () =>
          validatePasswordResetChangePayload({
            token: "a".repeat(64),
            newPassword,
          }),
        { message: "Password must be between 8 and 72 characters." },
      );
    }
  });
});

describe("validateUserPatchPayload", () => {
  it("trims username and currency", () => {
    expect(
      validateUserPatchPayload({
        username: "  Ada  ",
        currency: " EUR ",
      }),
    ).toEqual({ username: "Ada", currency: "EUR" });
  });

  it("accepts a single field", () => {
    expect(validateUserPatchPayload({ username: "Ada" })).toEqual({
      username: "Ada",
    });
    expect(validateUserPatchPayload({ currency: "EUR" })).toEqual({
      currency: "EUR",
    });
  });

  it("rejects unsupported fields", () => {
    expectAppError(
      () => validateUserPatchPayload({ email: "ada@example.com" }),
      { message: "Only username and currency may be updated." },
    );
  });

  it("rejects empty payloads", () => {
    expectAppError(() => validateUserPatchPayload({}), {
      message: "At least one of username or currency is required.",
    });
  });

  it("rejects empty or overlong values", () => {
    expectAppError(() => validateUserPatchPayload({ username: "   " }), {
      message: "Username must be between 1 and 255 characters.",
    });
    expectAppError(
      () => validateUserPatchPayload({ username: "a".repeat(256) }),
      { message: "Username must be between 1 and 255 characters." },
    );
    expectAppError(() => validateUserPatchPayload({ currency: "" }), {
      message: "Currency must be between 1 and 20 characters.",
    });
    expectAppError(
      () => validateUserPatchPayload({ currency: "a".repeat(21) }),
      { message: "Currency must be between 1 and 20 characters." },
    );
  });

  it("rejects non-string values for known fields", () => {
    expectAppError(() => validateUserPatchPayload({ username: 42 }), {
      message: "Username must be between 1 and 255 characters.",
    });
  });
});

describe("parseJsonPayload", () => {
  it("parses a JSON request body", async () => {
    await expect(
      parseJsonPayload(jsonRequest(JSON.stringify({ username: "Ada" }))),
    ).resolves.toEqual({ username: "Ada" });
  });

  it("wraps malformed JSON in a validation error", async () => {
    await expectAppErrorAsync(parseJsonPayload(jsonRequest("{")), {
      message: "Request body must contain valid JSON.",
      status: 400,
      title: "Bad Request",
      origin: "validation",
    });
  });
});

describe("parseOptionalJsonPayload", () => {
  it("returns an empty object when the body is missing or blank", async () => {
    await expect(
      parseOptionalJsonPayload(jsonRequest("")),
    ).resolves.toEqual({});
    await expect(
      parseOptionalJsonPayload(jsonRequest("   \n  ")),
    ).resolves.toEqual({});
  });

  it("parses a non-empty JSON body", async () => {
    await expect(
      parseOptionalJsonPayload(jsonRequest(JSON.stringify({ email: "a@b.co" }))),
    ).resolves.toEqual({ email: "a@b.co" });
  });

  it("wraps malformed JSON in a validation error", async () => {
    await expectAppErrorAsync(parseOptionalJsonPayload(jsonRequest("{")), {
      message: "Request body must contain valid JSON.",
      status: 400,
    });
  });
});
