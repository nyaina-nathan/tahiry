import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { createTransfer } from "@/services/transfer.service";
import { validateTransferInput } from "@/validators/money-movement.validator";
import { parseJsonPayload } from "@/validators/auth.validator";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const payload = validateTransferInput(await parseJsonPayload(request));
  const movement = await createTransfer(
    request.headers.get("X-User-Id"),
    payload,
  );

  return NextResponse.json(movement, { status: 201 });
});
