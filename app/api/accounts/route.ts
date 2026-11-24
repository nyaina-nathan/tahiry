import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import { createAccount, listAccounts } from "@/services/account.service";
import {
  validateAccountInput,
} from "@/validators/account.validator";
import { parseJsonPayload } from "@/validators/auth.validator";

export const GET = withErrorHandler(
  withRateLimit("api.read", async (request: NextRequest) => {
    const accounts = await listAccounts(await getCurrentUser(request));

    return NextResponse.json(accounts);
  }),
);

export const POST = withErrorHandler(
  withRateLimit("api.write", async (request: NextRequest) => {
    const userId = await getCurrentUser(request);
    const payload = validateAccountInput(await parseJsonPayload(request));
    const account = await createAccount(userId, payload);

    return NextResponse.json(account, { status: 201 });
  }),
);
