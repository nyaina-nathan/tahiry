import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
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
    const movement = await getMoneyMovement(await getCurrentUser(request), id);

    return NextResponse.json(movement);
  },
);

export const PATCH = withErrorHandler<MoneyMovementRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const userId = await getCurrentUser(request);
    const payload = validateMovementPatch(await parseJsonPayload(request));
    const movement = await updateMoneyMovement(userId, id, payload);

    return NextResponse.json(movement);
  },
);

export const DELETE = withErrorHandler<MoneyMovementRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    await deleteMoneyMovement(await getCurrentUser(request), id);

    return new Response(null, { status: 204 });
  },
);
