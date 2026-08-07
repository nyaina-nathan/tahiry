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
      className="mt-8 border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-4 py-3 text-sm text-[#812020]"
    >
      {message}
    </p>
  );
}
