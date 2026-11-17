import type { NextRequest } from "next/server";
import { AppError } from "@/libs/errors/app-error";
import { confirmEmailChange } from "@/services/email-change.service";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const settingsUrl = new URL("/settings", request.url);

  try {
    await confirmEmailChange(request.nextUrl.searchParams.get("token"));
    settingsUrl.searchParams.set("emailChangeSuccess", "true");
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error("Email change confirmation failed", error);
    }

    settingsUrl.searchParams.set("emailChangeSuccess", "false");
  }

  const response = NextResponse.redirect(settingsUrl, 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
