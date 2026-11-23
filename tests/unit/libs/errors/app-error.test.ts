import { describe, expect, it } from "vitest";
import {
  AppError,
  duplicateEmailError,
  invalidCredentialsError,
  isUniqueConstraintError,
} from "@/libs/errors/app-error";

describe("AppError", () => {
  it("stores the HTTP and origin metadata", () => {
    const error = new AppError("Bad Request", "Invalid input.", 400, "validation");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("AppError");
    expect(error.title).toBe("Bad Request");
    expect(error.message).toBe("Invalid input.");
    expect(error.status).toBe(400);
    expect(error.origin).toBe("validation");
  });

  it("preserves the subclass prototype when extended", () => {
    class NotFoundError extends AppError {
      constructor() {
        super("Not Found", "Missing.", 404, "resource");
      }
    }

    const error = new NotFoundError();

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe("isUniqueConstraintError", () => {
  it("detects Prisma's P2002 code", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
  });

  it("ignores other errors and non-object values", () => {
    expect(isUniqueConstraintError({ code: "P2025" })).toBe(false);
    expect(isUniqueConstraintError(new Error("P2002"))).toBe(false);
    expect(isUniqueConstraintError(null)).toBe(false);
    expect(isUniqueConstraintError(undefined)).toBe(false);
    expect(isUniqueConstraintError("P2002")).toBe(false);
    expect(isUniqueConstraintError(42)).toBe(false);
  });
});

describe("error factories", () => {
  it("builds a 409 duplicate email error", () => {
    const error = duplicateEmailError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.title).toBe("Conflict");
    expect(error.message).toBe("Email is already registered.");
    expect(error.status).toBe(409);
    expect(error.origin).toBe("authentication");
  });

  it("builds a 401 invalid credentials error", () => {
    const error = invalidCredentialsError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.title).toBe("Unauthorized");
    expect(error.message).toBe("Invalid email or password.");
    expect(error.status).toBe(401);
    expect(error.origin).toBe("authentication");
  });

  it("returns a fresh error instance every time", () => {
    expect(duplicateEmailError()).not.toBe(duplicateEmailError());
    expect(invalidCredentialsError()).not.toBe(invalidCredentialsError());
  });
});
