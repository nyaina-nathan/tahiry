import type { ApiErrorResponse } from "@/features/auth/types";

const FALLBACK_ERROR = "We could not update your password.";

export async function changePassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch("/api/auth/password-reset/change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null;

    throw new Error(data?.error?.message ?? FALLBACK_ERROR);
  }
}
