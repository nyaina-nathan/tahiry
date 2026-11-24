import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import { AppError } from "@/libs/errors/app-error";
import { confirmPasswordResetToken } from "@/services/password-reset-confirm.service";

export const GET = withRateLimit(
  "auth.passwordConfirm",
  async (request: NextRequest) => {
    const token = request.nextUrl.searchParams.get("token");
    let response: NextResponse;

    try {
      await confirmPasswordResetToken(token);
      const passwordChangeUrl = new URL("/password-change", request.url);
      if (token) {
        passwordChangeUrl.searchParams.set("token", token);
      }
      response = NextResponse.redirect(passwordChangeUrl, 303);
    } catch (error) {
      if (!(error instanceof AppError)) {
        console.error("Password reset confirmation failed", error);
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("isPasswordResetFail", "true");
      response = NextResponse.redirect(loginUrl, 303);
    }

    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  },
);
