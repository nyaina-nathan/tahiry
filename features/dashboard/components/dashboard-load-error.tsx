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
      className="border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-5 py-5"
      role="alert"
    >
      <p className="font-semibold text-[#812020]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 border border-[#d98c8c] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#812020] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)]"
      >
        Try again
      </button>
    </section>
  );
}
