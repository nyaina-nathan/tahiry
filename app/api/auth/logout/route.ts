import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { withRateLimit } from "@/libs/api/with-rate-limit";

export const POST = withErrorHandler(
  withRateLimit("auth.logout", async () => {
    const response = new NextResponse(null, { status: 204 });
    response.cookies.delete("sess_id");

    return response;
  }),
);
