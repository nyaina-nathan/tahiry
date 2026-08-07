import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import {
  deleteMoneyMovement,
  getMoneyMovement,
  updateMoneyMovement,
} from "@/services/money-movement.service";
import { parseJsonPayload } from "@/validators/auth.validator";
import { validateMovementPatch } from "@/validators/money-movement.validator";

type MoneyMovementRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withErrorHandler<MoneyMovementRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const movement = await getMoneyMovement(
      request.headers.get("X-User-Id"),
      id,
    );

    return NextResponse.json(movement);
  },
);

export const PATCH = withErrorHandler<MoneyMovementRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = validateMovementPatch(await parseJsonPayload(request));
    const movement = await updateMoneyMovement(
      request.headers.get("X-User-Id"),
      id,
      payload,
    );

    return NextResponse.json(movement);
  },
);

export const DELETE = withErrorHandler<MoneyMovementRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    await deleteMoneyMovement(request.headers.get("X-User-Id"), id);

    return new Response(null, { status: 204 });
  },
);
