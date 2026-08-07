type CategoryDeleteConfirmationProps = {
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeletingThis: boolean;
};

export function CategoryDeleteConfirmation({
  isDeleting,
  onConfirm,
  onCancel,
  isDeletingThis,
}: CategoryDeleteConfirmationProps) {
  if (!isDeleting) {
    return null;
  }

  return (
    <div className="border-l-2 border-[var(--color-danger)] bg-[#fff7f7] px-3 py-3 sm:max-w-xs">
      <p className="text-xs leading-5 text-[#812020]">
        Related movements will stay, but lose this category.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeletingThis}
          className="min-h-10 bg-[var(--color-danger)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60"
        >
          {isDeletingThis ? "Deleting..." : "Delete"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeletingThis}
          className="min-h-10 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
        >
          Keep
        </button>
      </div>
    </div>
  );
}
