import { beforeEach, describe, expect, it } from "vitest";
import {
  getUserById,
  loginUser,
  registerUser,
  updateCurrentUser,
} from "@/services/auth.service";
import { verifyToken } from "@/services/jwt.service";
import { prisma, resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import { TEST_PASSWORD, createUser } from "./helpers/fixtures";

beforeEach(resetDatabase);

const registerPayload = (email = "ada@example.com") => ({
  username: "Ada",
  email,
  password: TEST_PASSWORD,
  currency: "EUR",
});

describe("registerUser", () => {
  it("creates the user, a default cash account and a verifiable session", async () => {
    const result = await registerUser(registerPayload());

    expect(result.user).toMatchObject({
      username: "Ada",
      email: "ada@example.com",
      currency: "EUR",
    });
    expect(result.user).not.toHaveProperty("password_hash");
    await expect(verifyToken(result.token)).resolves.toEqual({
      sub: result.user.id,
    });

    const accounts = await prisma.account.findMany({
      where: { id_user: result.user.id },
    });
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe("cash");

    const stored = await prisma.users.findUniqueOrThrow({
      where: { id: result.user.id },
    });
    expect(stored.password_hash).not.toBe(TEST_PASSWORD);
  });

  it("rejects a duplicate email without creating a second account", async () => {
    const first = await registerUser(registerPayload());

    await expectAppErrorAsync(registerUser(registerPayload()), {
      title: "Conflict",
      message: "Email is already registered.",
      status: 409,
      origin: "authentication",
    });

    await expect(
      prisma.account.count({ where: { id_user: first.user.id } }),
    ).resolves.toBe(1);
    await expect(
      prisma.users.count({ where: { email: "ada@example.com" } }),
    ).resolves.toBe(1);
  });
});

describe("loginUser", () => {
  it("returns the public user and a session for valid credentials", async () => {
    const registered = await registerUser(registerPayload());

    const result = await loginUser({
      email: "ada@example.com",
      password: TEST_PASSWORD,
    });

    expect(result.user).toMatchObject({
      id: registered.user.id,
      username: "Ada",
      email: "ada@example.com",
    });
    expect(result.user).not.toHaveProperty("password_hash");
    await expect(verifyToken(result.token)).resolves.toEqual({
      sub: registered.user.id,
    });
  });

  it("rejects a wrong password and an unknown email identically", async () => {
    await registerUser(registerPayload());

    await expectAppErrorAsync(
      loginUser({ email: "ada@example.com", password: "wrong-password" }),
      {
        title: "Unauthorized",
        message: "Invalid email or password.",
        status: 401,
      },
    );
    await expectAppErrorAsync(
      loginUser({ email: "unknown@example.com", password: TEST_PASSWORD }),
      { message: "Invalid email or password.", status: 401 },
    );
  });
});

describe("getUserById", () => {
  it("returns the public user record", async () => {
    const user = await createUser({ username: "Grace", currency: "MGA" });

    await expect(getUserById(user.id)).resolves.toMatchObject({
      id: user.id,
      username: "Grace",
      currency: "MGA",
    });
  });

  it("rejects missing, malformed and unknown user ids", async () => {
    for (const userId of [null, "not-a-uuid", "123e4567-e89b-42d3-a456-426614174000"]) {
      await expectAppErrorAsync(getUserById(userId), {
        title: "Unauthorized",
        message: "Authentication is missing or invalid.",
        status: 401,
      });
    }
  });
});

describe("updateCurrentUser", () => {
  it("updates the username and currency", async () => {
    const user = await createUser({ username: "Old", currency: "USD" });

    const updated = await updateCurrentUser(user.id, {
      username: "New",
      currency: "EUR",
    });

    expect(updated).toMatchObject({ username: "New", currency: "EUR" });
    await expect(
      prisma.users.findUniqueOrThrow({ where: { id: user.id } }),
    ).resolves.toMatchObject({ username: "New", currency: "EUR" });
  });

  it("keeps the existing value for fields that are not provided", async () => {
    const user = await createUser({ username: "Old", currency: "USD" });

    await expect(
      updateCurrentUser(user.id, { currency: "EUR" }),
    ).resolves.toMatchObject({ username: "Old", currency: "EUR" });
  });

  it("rejects invalid or unknown users", async () => {
    await expectAppErrorAsync(updateCurrentUser(null, { username: "New" }), {
      status: 401,
    });
    await expectAppErrorAsync(
      updateCurrentUser("123e4567-e89b-42d3-a456-426614174000", {
        username: "New",
      }),
      { status: 401 },
    );
  });
});
