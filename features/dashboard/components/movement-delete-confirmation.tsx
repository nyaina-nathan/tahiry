type MovementDeleteConfirmationProps = {
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeletingThis: boolean;
};

export function MovementDeleteConfirmation({
  title,
  isDeleting,
  onConfirm,
  onCancel,
  isDeletingThis,
}: MovementDeleteConfirmationProps) {
  if (!isDeleting) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={`Delete ${title}`}
    >
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeletingThis}
        className="min-h-10 bg-[var(--color-danger)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60"
      >
        {isDeletingThis ? "Deleting..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isDeletingThis}
        className="min-h-10 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
      >
        Keep
      </button>
    </div>
  );
}
