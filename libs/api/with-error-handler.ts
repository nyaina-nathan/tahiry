import type { NextRequest } from "next/server";
import { AppError } from "@/libs/errors/app-error";

export type RouteContext = Record<string, unknown>;
export type RouteHandler<TContext extends RouteContext = RouteContext> = (
  request: NextRequest,
  context: TContext,
) => Response | Promise<Response>;

function errorResponse(error: AppError): Response {
  return Response.json(
    {
      error: {
        title: error.title,
        message: error.message,
        status: error.status,
        origin: error.origin,
      },
    },
    { status: error.status },
  );
}

export function withErrorHandler<TContext extends RouteContext = RouteContext>(
  handler: RouteHandler<TContext>,
): RouteHandler<TContext> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error(error)
      
      if (error instanceof AppError) {
        return errorResponse(error);
      }

      return errorResponse(
        new AppError(
          "Internal Server Error",
          "An unexpected error occurred.",
          500,
          "system",
        ),
      );
    }
  };
}
