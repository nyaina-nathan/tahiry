export function getPasswordResetFailure(search: string): boolean {
  return new URLSearchParams(search).get("isPasswordResetFail") === "true";
}

export function removePasswordResetFailureFromUrl(urlValue: string): string {
  const url = new URL(urlValue);
  url.searchParams.delete("isPasswordResetFail");

  return `${url.pathname}${url.search}${url.hash}`;
}
