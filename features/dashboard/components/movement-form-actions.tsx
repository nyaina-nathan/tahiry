import type { Mutation } from "@/features/dashboard/types";

type MovementFormActionsProps = {
  mutation: Mutation;
  editingId: string | null;
  onReset: () => void;
};

export function MovementFormActions({
  mutation,
  editingId,
  onReset,
}: MovementFormActionsProps) {
  const isSaving = mutation === "create" || mutation === "update";

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        disabled={isSaving}
        className="min-h-13 flex-1 bg-[var(--color-strong)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-contrast)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:cursor-wait disabled:opacity-60"
      >
        {mutation === "create"
          ? "Saving..."
          : mutation === "update"
            ? "Updating..."
            : editingId
              ? "Save changes"
              : "Add movement"}
      </button>
      {editingId && (
        <button
          type="button"
          onClick={onReset}
          disabled={mutation === "update"}
          className="min-h-13 border border-[var(--color-line)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:opacity-60"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
