type DashboardLoadErrorProps = {
  message: string;
  onRetry: () => void;
};

export function DashboardLoadError({
  message,
  onRetry,
}: DashboardLoadErrorProps) {
  return (
    <section
      className="border-l-4 border-[var(--color-negative)] bg-[var(--color-negative-soft)] px-5 py-5"
      role="alert"
    >
      <p className="font-semibold text-[var(--color-negative-strong)]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 border border-[var(--color-negative-line)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-negative-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-negative)]"
      >
        Try again
      </button>
    </section>
  );
}
