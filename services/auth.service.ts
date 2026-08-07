import bcrypt from "bcrypt";
import { prisma } from "@/libs/db/prisma";
import { AppError, duplicateEmailError, invalidCredentialsError, isUniqueConstraintError } from "@/libs/errors/app-error";
import type { LoginPayload, RegisterPayload } from "@/validators/auth.validator";
import { createSessionToken } from "./jwt.service";
import { AuthResult, publicUserSelect } from "@/types/auth.types";

const PASSWORD_HASH_ROUNDS = 12;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResult> {
  const passwordHash = await bcrypt.hash(payload.password, PASSWORD_HASH_ROUNDS);

  try {
    const user = await prisma.users.create({
      data: {
        username: payload.username,
        email: payload.email,
        password_hash: passwordHash,
        currency: payload.currency,
      },
      select: publicUserSelect,
    });

    return {
      user,
      token: await createSessionToken(user.id),
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw duplicateEmailError();
    }

    throw error;
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  const user = await prisma.users.findUnique({
    where: { email: payload.email },
    select: {
      ...publicUserSelect,
      password_hash: true,
    },
  });

  if (!user || !(await bcrypt.compare(payload.password, user.password_hash))) {
    throw invalidCredentialsError();
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      currency: user.currency,
      created_at: user.created_at,
    },
    token: await createSessionToken(user.id),
  };
}

export async function getCurrentUser(userId: string | null) {
  if (!userId || !UUID_PATTERN.test(userId)) {
    throw new AppError(
      "Unauthorized",
      "Authentication is missing or invalid.",
      401,
      "authentication",
    );
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(
      "Unauthorized",
      "Authentication is missing or invalid.",
      401,
      "authentication",
    );
  }

  return user;
}
