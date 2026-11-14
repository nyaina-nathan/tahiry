export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatMoney(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "MGA",
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency || "MGA"} ${amount}`;
  }
}

export function formatAxisMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
      style: "currency",
      currency: currency || "MGA",
      currencyDisplay: "narrowSymbol",
    }).format(amount);
  } catch {
    return `${currency || "MGA"} ${amount}`;
  }
}

export function formatWeekdayDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDate(date: string | null) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
