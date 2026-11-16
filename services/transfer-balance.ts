function normalize(value: string): string {
  const [whole, fraction = ""] = value.split(".");
  const normalizedWhole = whole.replace(/^0+(?=\d)/, "");

  return `${normalizedWhole}${fraction.padEnd(2, "0").slice(0, 2)}`;
}

export function isSufficientBalance(
  balance: string,
  amount: string,
): boolean {
  if (balance.startsWith("-")) {
    return false;
  }

  const normalizedBalance = normalize(balance);
  const normalizedAmount = normalize(amount);

  return (
    normalizedBalance.length > normalizedAmount.length ||
    (normalizedBalance.length === normalizedAmount.length &&
      normalizedBalance >= normalizedAmount)
  );
}
