import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/libs/api/get-current-user";
import { withErrorHandler } from "@/libs/api/with-error-handler";
import {
  deleteCategory,
  getCategory,
  updateCategory,
} from "@/services/category.service";
import { parseJsonPayload } from "@/validators/auth.validator";
import { validateCategoryPatch } from "@/validators/category.validator";

type CategoryRouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withErrorHandler<CategoryRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const category = await getCategory(await getCurrentUser(request), id);

    return NextResponse.json(category);
  },
);

export const PATCH = withErrorHandler<CategoryRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    const userId = await getCurrentUser(request);
    const payload = validateCategoryPatch(await parseJsonPayload(request));
    const category = await updateCategory(userId, id, payload);

    return NextResponse.json(category);
  },
);

export const DELETE = withErrorHandler<CategoryRouteContext>(
  async (request: NextRequest, context) => {
    const { id } = await context.params;
    await deleteCategory(await getCurrentUser(request), id);

    return new Response(null, { status: 204 });
  },
);
