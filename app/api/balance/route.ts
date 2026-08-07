import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { getBalance } from "@/services/balance.service";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const balance = await getBalance(request.headers.get("X-User-Id"));

  return NextResponse.json(balance);
});
