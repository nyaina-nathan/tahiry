import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";

export const POST = withErrorHandler(async () => {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete("sess_id");

  return response;
});
