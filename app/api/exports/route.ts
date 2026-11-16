import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import { createMoneyMovementsExport } from "@/services/export.service";
import { parseOptionalJsonPayload } from "@/validators/auth.validator";
import { validateExportInput } from "@/validators/export.validator";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const payload = validateExportInput(
    await parseOptionalJsonPayload(request),
  );
  const workbook = await createMoneyMovementsExport(
    request.headers.get("X-User-Id"),
    payload,
  );

  return new NextResponse(workbook, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="money-movements.xlsx"',
      "Content-Length": workbook.byteLength.toString(),
    },
  });
});
