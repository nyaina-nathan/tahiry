type CategoriesLoadErrorProps = {
  message: string;
  onRetry: () => void;
};

export function CategoriesLoading() {
  return (
    <div className="space-y-8" aria-label="Loading categories">
      {["expense", "income"].map((group) => (
        <div key={group}>
          <div className="mb-4 h-12 animate-pulse border-b border-[var(--color-line)] bg-[var(--color-line)]" />
          <div className="h-20 animate-pulse border border-[var(--color-line)] bg-[var(--color-surface)]" />
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
    </div>
  );
}

export function CategoriesEmptyState() {
  return (
    <div className="border border-dashed border-[var(--color-line)] px-6 py-14 text-center">
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
      className="mt-8 border-l-4 border-[var(--color-negative)] bg-[var(--color-negative-soft)] px-4 py-3 text-sm text-[var(--color-negative-strong)]"
    >
      {message}
    </p>
  );
}
