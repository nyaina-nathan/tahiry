import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import { registerUser } from "@/services/auth.service";
import {
  parseJsonPayload,
  validateRegisterPayload,
} from "@/validators/auth.validator";

const SESSION_COOKIE_NAME = "sess_id";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export const POST = withErrorHandler(
  withRateLimit("auth.register", async (request: NextRequest) => {
    const payload = await parseJsonPayload(request);
    const result = await registerUser(validateRegisterPayload(payload));
    const response = NextResponse.json(result.user, { status: 201 });

    response.cookies.set(SESSION_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  }),
);
