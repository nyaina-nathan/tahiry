import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import {
  createCategory,
  listCategories,
} from "@/services/category.service";
import {
  parseCategoryTypeQuery,
  validateCategoryInput,
} from "@/validators/category.validator";
import { parseJsonPayload } from "@/validators/auth.validator";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const categoryType = parseCategoryTypeQuery(
    request.nextUrl.searchParams.get("cat_type"),
  );
  const categories = await listCategories(
    await getCurrentUser(request),
    categoryType,
  );

  return NextResponse.json(categories);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getCurrentUser(request);
  const payload = validateCategoryInput(await parseJsonPayload(request));
  const category = await createCategory(userId, payload);

  return NextResponse.json(category, { status: 201 });
});
