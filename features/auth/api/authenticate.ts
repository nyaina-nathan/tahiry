import type {
  ApiErrorResponse,
  AuthMode,
  AuthPayload,
} from "@/features/auth/types";

const FALLBACK_ERROR = "We could not complete that request.";

export async function authenticate(mode: AuthMode, payload: AuthPayload) {
  const response = await fetch(
    mode === "register" ? "/api/auth/register" : "/api/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null;

    throw new Error(data?.error?.message ?? FALLBACK_ERROR);
  }
}
