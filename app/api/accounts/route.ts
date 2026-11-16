import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { createAccount, listAccounts } from "@/services/account.service";
import {
  validateAccountInput,
} from "@/validators/account.validator";
import { parseJsonPayload } from "@/validators/auth.validator";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const accounts = await listAccounts(request.headers.get("X-User-Id"));

  return NextResponse.json(accounts);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const payload = validateAccountInput(await parseJsonPayload(request));
  const account = await createAccount(
    request.headers.get("X-User-Id"),
    payload,
  );

  return NextResponse.json(account, { status: 201 });
});
