import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { getCurrentUser } from "@/services/auth.service";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request.headers.get("X-User-ID"));

  return NextResponse.json(user);
});
