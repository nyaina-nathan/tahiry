import type { NextRequest } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { confirmEmailChange } from "@/services/email-change.service";

export const GET = withErrorHandler(async (request: NextRequest) => {
  await confirmEmailChange(request.nextUrl.searchParams.get("token"));

  return Response.json({
    message: "Email address changed successfully.",
  });
});
