type DashboardActionErrorProps = {
  message: string;
};

export function DashboardActionError({
  message,
}: DashboardActionErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="mt-8 border-l-4 border-[var(--color-negative)] bg-[var(--color-negative-soft)] px-4 py-3 text-sm text-[var(--color-negative-strong)]"
    >
      {message}
    </p>
  );
}
