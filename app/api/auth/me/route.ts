import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import {
  getCurrentUser,
  updateCurrentUser,
} from "@/services/auth.service";
import {
  parseJsonPayload,
  validateUserPatchPayload,
} from "@/validators/auth.validator";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request.headers.get("X-User-ID"));

  return NextResponse.json(user);
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const user = await updateCurrentUser(
    request.headers.get("X-User-ID"),
    validateUserPatchPayload(await parseJsonPayload(request)),
  );

  return NextResponse.json(user);
});
