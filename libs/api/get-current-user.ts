import type { NextRequest } from "next/server";
import { AppError } from "@/libs/errors/app-error";
import { verifyToken } from "@/services/jwt.service";

const SESSION_COOKIE_NAME = "sess_id";

export async function getCurrentUser(request: NextRequest): Promise<string> {
  const session = await verifyToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (!session?.sub) {
    throw new AppError(
      "Unauthorized",
      "Authentication is missing or invalid.",
      401,
      "authentication",
    );
  }

  return session.sub;
}
