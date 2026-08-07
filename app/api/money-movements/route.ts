import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
    request.headers.get("X-User-Id"),
    filters,
  );

  return NextResponse.json(page);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const payload = validateMovementInput(await parseJsonPayload(request));
  const movement = await createMoneyMovement(
    request.headers.get("X-User-Id"),
    payload,
  );

  return NextResponse.json(movement, { status: 201 });
});
