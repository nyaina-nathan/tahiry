type MovementPaginationProps = {
  page: number;
  totalPages: number;
  isListLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function MovementPagination({
  page,
  totalPages,
  isListLoading,
  onPrevious,
  onNext,
}: MovementPaginationProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-y-3 border-t border-[var(--color-line)] pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1 || isListLoading}
          onClick={onPrevious}
          className="min-h-11 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages || isListLoading}
          onClick={onNext}
          className="min-h-11 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
