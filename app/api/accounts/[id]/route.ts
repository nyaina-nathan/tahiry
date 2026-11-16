import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import {
  deleteAccount,
  getAccount,
  updateAccount,
} from "@/services/account.service";
import { parseJsonPayload } from "@/validators/auth.validator";
import { validateAccountPatch } from "@/validators/account.validator";

type AccountRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withErrorHandler<AccountRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const account = await getAccount(
      request.headers.get("X-User-Id"),
      id,
    );

    return NextResponse.json(account);
  },
);

export const PATCH = withErrorHandler<AccountRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const payload = validateAccountPatch(await parseJsonPayload(request));
    const account = await updateAccount(
      request.headers.get("X-User-Id"),
      id,
      payload,
    );

    return NextResponse.json(account);
  },
);

export const DELETE = withErrorHandler<AccountRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    await deleteAccount(request.headers.get("X-User-Id"), id);

    return new Response(null, { status: 204 });
  },
);
