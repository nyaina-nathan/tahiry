import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  verifyToken,
} from "@/services/jwt.service";
import { expectAppErrorAsync } from "../helpers/expect-app-error";

const USER_ID = "123e4567-e89b-42d3-a456-426614174000";
const ORIGINAL_SECRET = process.env.JWT_SECRET;

describe("jwt.service", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret";
  });

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = ORIGINAL_SECRET;
    }
  });

  it("creates a three-part JWT and verifies its subject", async () => {
    const token = await createSessionToken(USER_ID);

    expect(token.split(".")).toHaveLength(3);
    await expect(verifyToken(token)).resolves.toEqual({ sub: USER_ID });
  });

  it("returns null for missing tokens", async () => {
    await expect(verifyToken(undefined)).resolves.toBeNull();
    await expect(verifyToken("")).resolves.toBeNull();
  });

  it("returns null for tampered or malformed tokens", async () => {
    const token = await createSessionToken(USER_ID);

    await expect(verifyToken(`${token}tampered`)).resolves.toBeNull();
    await expect(verifyToken("not-a-jwt")).resolves.toBeNull();
  });

  it("returns null when the token was signed with another secret", async () => {
    const token = await createSessionToken(USER_ID);
    process.env.JWT_SECRET = "a-different-secret";

    await expect(verifyToken(token)).resolves.toBeNull();
  });

  it("fails to issue sessions when the secret is not configured", async () => {
    delete process.env.JWT_SECRET;

    await expectAppErrorAsync(createSessionToken(USER_ID), {
      title: "Configuration Error",
      message: "JWT_SECRET is not configured.",
      status: 500,
      origin: "configuration",
    });
  });

  it("treats a missing secret as an unverifiable session", async () => {
    delete process.env.JWT_SECRET;

    await expect(verifyToken("header.payload.signature")).resolves.toBeNull();
  });
});
