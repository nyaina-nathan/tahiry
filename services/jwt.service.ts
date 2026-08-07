import { AppError } from "@/libs/errors/app-error";
import { jwtVerify, SignJWT } from "jose";

const JWT_ALGORITHM = "HS256";
const JWT_EXPIRATION = "7d";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(
      "Configuration Error",
      "JWT_SECRET is not configured.",
      500,
      "configuration",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: JWT_ALGORITHM, typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string | undefined
): Promise<{ sub: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    return { sub: payload.sub as string };
  } catch {
    return null;
  }
}