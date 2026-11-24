import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";
import { createTransfer } from "@/services/transfer.service";
import { validateTransferInput } from "@/validators/money-movement.validator";
import { parseJsonPayload } from "@/validators/auth.validator";

export const POST = withErrorHandler(
  withRateLimit("api.transfer", async (request: NextRequest) => {
    const userId = await getCurrentUser(request);
    const payload = validateTransferInput(await parseJsonPayload(request));
    const movement = await createTransfer(userId, payload);

    return NextResponse.json(movement, { status: 201 });
  }),
);
