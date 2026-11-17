export function getEmailChangeResult(search: string): boolean | null {
  const result = new URLSearchParams(search).get("emailChangeSuccess");

  if (result === "true") {
    return true;
  }

  if (result === "false") {
    return false;
  }

  return null;
}

export function removeEmailChangeResultFromUrl(urlValue: string): string {
  const url = new URL(urlValue);
  url.searchParams.delete("emailChangeSuccess");

  return `${url.pathname}${url.search}${url.hash}`;
}
