type ExportDateRange = {
  from?: string;
  to?: string;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

async function getErrorMessage(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error?.message ?? "The Excel export could not be created.";
}

export async function downloadMoneyMovementsExport(
  dateRange: ExportDateRange,
): Promise<void> {
  const response = await fetch("/api/exports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dateRange),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "money-movements.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
