type CategoriesLoadErrorProps = {
  message: string;
  onRetry: () => void;
};

export function CategoriesLoading() {
  return (
    <div className="space-y-8" aria-label="Loading categories">
      {["expense", "income"].map((group) => (
        <div key={group}>
          <div className="mb-4 h-12 animate-pulse rounded-md border-b border-[var(--color-line)] bg-[var(--color-line)]" />
          <div className="dash-panel h-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function CategoriesLoadError({
  message,
  onRetry,
}: CategoriesLoadErrorProps) {
  return (
    <div
      className="rounded-[1rem] border border-[var(--color-negative-line)] bg-[var(--color-negative-soft)] px-5 py-5 shadow-[0_14px_32px_-26px_rgba(2,44,34,0.35)] sm:rounded-[var(--radius-card)]"
      role="alert"
    >
      <p className="font-semibold text-[var(--color-negative-strong)]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-[0.65rem] border border-[var(--color-negative-line)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-negative-strong)] transition-colors hover:bg-[var(--color-negative-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-negative)]"
      >
        Try again
      </button>
    </div>
  );
}

export function CategoriesEmptyState() {
  return (
    <div className="dash-panel dash-panel-dashed px-6 py-14 text-center">
      <p className="font-display text-3xl text-[var(--color-ink)]">
        No categories yet.
      </p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
        Add a category to start giving your money movements a useful shape.
      </p>
    </div>
  );
}

type CategoriesActionErrorProps = {
  message: string;
};

export function CategoriesActionError({
  message,
}: CategoriesActionErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="mt-8 rounded-[0.8rem] border border-[var(--color-negative-line)] bg-[var(--color-negative-soft)] px-4 py-3 text-sm text-[var(--color-negative-strong)]"
    >
      {message}
    </p>
  );
}
