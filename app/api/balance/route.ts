import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { getBalance } from "@/services/balance.service";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const balance = await getBalance(await getCurrentUser(request));

  return NextResponse.json(balance);
});
