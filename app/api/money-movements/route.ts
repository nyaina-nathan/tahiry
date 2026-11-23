import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import {
  createMoneyMovement,
  listMoneyMovements,
} from "@/services/money-movement.service";
import { parseJsonPayload } from "@/validators/auth.validator";
import {
  parseMovementFilters,
  validateMovementInput,
} from "@/validators/money-movement.validator";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const filters = parseMovementFilters(request.nextUrl.searchParams);
  const page = await listMoneyMovements(
    await getCurrentUser(request),
    filters,
  );

  return NextResponse.json(page);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getCurrentUser(request);
  const payload = validateMovementInput(await parseJsonPayload(request));
  const movement = await createMoneyMovement(userId, payload);

  return NextResponse.json(movement, { status: 201 });
});
