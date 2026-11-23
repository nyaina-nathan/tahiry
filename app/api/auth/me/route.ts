import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import {
  getUserById,
  updateCurrentUser,
} from "@/services/auth.service";
import {
  parseJsonPayload,
  validateUserPatchPayload,
} from "@/validators/auth.validator";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getUserById(await getCurrentUser(request));

  return NextResponse.json(user);
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const user = await updateCurrentUser(
    await getCurrentUser(request),
    validateUserPatchPayload(await parseJsonPayload(request)),
  );

  return NextResponse.json(user);
});
