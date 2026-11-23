import type { Category } from "@/types/category.types";
import type { Account } from "@/types/account.types";
import type { MoneyMovement, MovementPage } from "@/types/money-movement.types";
import { MovementEmptyState } from "@/features/dashboard/components/movement-empty-state";
import { MovementItem } from "@/features/dashboard/components/movement-item";
import { MovementLoading } from "@/features/dashboard/components/movement-loading";
import { MovementPagination } from "@/features/dashboard/components/movement-pagination";
import { formatDate } from "@/features/dashboard/utils/formatters";

type MovementListProps = {
  movements: MovementPage | null;
  categories: Category[];
  accounts: Account[];
  currency: string;
  totalPages: number;
  isLoading: boolean;
  isListLoading: boolean;
  pendingDeleteId: string | null;
  deletingId: string | null;
  onBeginEditing: (movement: MoneyMovement) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  accountId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  selectedDay?: string | null;
  onClearSelectedDay?: () => void;
};

export function MovementList({
  movements,
  categories,
  accounts,
  currency,
  totalPages,
  isLoading,
  isListLoading,
  pendingDeleteId,
  deletingId,
  onBeginEditing,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onPreviousPage,
  onNextPage,
  accountId,
  emptyTitle,
  emptyDescription,
  selectedDay,
  onClearSelectedDay,
}: MovementListProps) {
  const dayFilterBanner = selectedDay ? (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[0.8rem] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
      <p className="text-xs text-[var(--color-muted)]">
        Showing movements from{" "}
        <span className="font-semibold text-[var(--color-ink)]">
          {formatDate(selectedDay)}
        </span>{" "}
        only.
      </p>
      {onClearSelectedDay && (
        <button
          type="button"
          onClick={onClearSelectedDay}
          className="min-h-10 rounded-[0.6rem] border border-[var(--color-line)] px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
        >
          Show all
        </button>
      )}
    </div>
  ) : null;

  if (isLoading || isListLoading) {
    return (
      <>
        {dayFilterBanner}
        <MovementLoading />
      </>
    );
  }

  if (!movements?.items.length) {
    return (
      <>
        {dayFilterBanner}
        <MovementEmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      </>
    );
  }

  return (
    <>
      {dayFilterBanner}
      <ul className="space-y-3">
        {movements.items.map((movement) => {
          const category = categories.find(
            (item) => item.id === movement.id_category,
          );
          const account = accounts.find((item) => item.id === movement.id_account);
          const sourceAccount = accounts.find(
            (item) => item.id === movement.id_account_source,
          );

          return (
            <MovementItem
              key={movement.id}
              movement={movement}
              categoryName={category?.cat_name ?? "Uncategorized"}
              accountName={account?.name}
              sourceAccountName={sourceAccount?.name}
              currency={currency}
              accountId={accountId}
              isDeleting={pendingDeleteId === movement.id}
              isDeletingThis={deletingId === movement.id}
              onBeginEditing={() => onBeginEditing(movement)}
              onRequestDelete={() => onRequestDelete(movement.id)}
              onConfirmDelete={() => onConfirmDelete(movement.id)}
              onCancelDelete={onCancelDelete}
            />
          );
        })}
      </ul>
      <MovementPagination
        page={movements.page}
        totalPages={totalPages}
        isListLoading={isListLoading}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
    </>
  );
}
