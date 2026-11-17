import type { ApiErrorResponse } from "@/features/auth/types";

const FALLBACK_ERROR = "We could not submit that password reset request.";

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch("/api/auth/password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null;

    throw new Error(data?.error?.message ?? FALLBACK_ERROR);
  }
}
