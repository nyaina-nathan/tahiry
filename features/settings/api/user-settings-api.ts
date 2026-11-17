import type { CurrentUser, UserPatch } from "@/types/user.types";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error?.message ?? fallback;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Your profile could not be loaded."),
    );
  }

  return (await response.json()) as CurrentUser;
}

export async function updateCurrentUser(
  payload: UserPatch,
): Promise<CurrentUser> {
  const response = await fetch("/api/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Your profile could not be updated."),
    );
  }

  return (await response.json()) as CurrentUser;
}
