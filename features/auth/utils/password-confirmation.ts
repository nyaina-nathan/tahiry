export function getPasswordConfirmationError(
  password: string,
  confirmation: string,
): string | null {
  return password === confirmation ? null : "The passwords do not match.";
}
