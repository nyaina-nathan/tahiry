export type EmailChangeRequest = {
  newEmail: string;
  currentPassword: string;
};

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

export async function requestEmailChange(
  payload: EmailChangeRequest,
): Promise<void> {
  const response = await fetch("/api/auth/email-change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Your email change request could not be sent.",
      ),
    );
  }
}
