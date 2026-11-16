import type { MoneyMovement } from "@/types/money-movement.types";
import { MovementDeleteConfirmation } from "@/features/dashboard/components/movement-delete-confirmation";
import { formatDate, formatMoney } from "@/features/dashboard/utils/formatters";

type MovementItemProps = {
  movement: MoneyMovement;
  categoryName: string;
  currency: string;
  isDeleting: boolean;
  isDeletingThis: boolean;
  onBeginEditing: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

export function MovementItem({
  movement,
  categoryName,
  currency,
  isDeleting,
  isDeletingThis,
  onBeginEditing,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: MovementItemProps) {
  const isIncome = movement.movement_type === "INCOME";

  return (
    <li className="border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center font-display text-2xl text-white ${isIncome ? "bg-[var(--color-positive)]" : "bg-[var(--color-negative-fill)]"}`}
            aria-hidden="true"
          >
            {isIncome ? "+" : "-"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[var(--color-ink)]">
              {movement.title}
            </p>
            <p className="mt-1 truncate text-sm text-[var(--color-muted)]">
              {categoryName} · {formatDate(movement.logged_for)}
            </p>
            {movement.description && (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
                {movement.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <p
            className={`font-mono text-lg font-bold ${isIncome ? "text-[var(--color-accent)]" : "text-[var(--color-negative)]"}`}
          >
            {isIncome ? "+" : "-"}
            {formatMoney(movement.amount, currency)}
          </p>
          {isDeleting ? (
            <MovementDeleteConfirmation
              title={movement.title}
              isDeleting
              onConfirm={onConfirmDelete}
              onCancel={onCancelDelete}
              isDeletingThis={isDeletingThis}
            />
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBeginEditing}
                aria-haspopup="dialog"
                aria-controls="movement-edit-dialog"
                className="min-h-10 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onRequestDelete}
                className="min-h-10 border border-[var(--color-negative-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-negative)] transition-colors hover:bg-[var(--color-negative-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-negative)]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {isDeleting && (
        <p className="mt-3 border-l-2 border-[var(--color-negative)] pl-3 text-xs text-[var(--color-negative-strong)]">
          This movement will be permanently removed.
        </p>
      )}
    </li>
  );
}
