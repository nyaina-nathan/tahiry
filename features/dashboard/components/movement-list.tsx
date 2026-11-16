import type { Category } from "@/types/category.types";
import type { MoneyMovement, MovementPage } from "@/types/money-movement.types";
import { MovementEmptyState } from "@/features/dashboard/components/movement-empty-state";
import { MovementItem } from "@/features/dashboard/components/movement-item";
import { MovementLoading } from "@/features/dashboard/components/movement-loading";
import { MovementPagination } from "@/features/dashboard/components/movement-pagination";

type MovementListProps = {
  movements: MovementPage | null;
  categories: Category[];
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
};

export function MovementList({
  movements,
  categories,
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
}: MovementListProps) {
  if (isLoading || isListLoading) {
    return <MovementLoading />;
  }

  if (!movements?.items.length) {
    return (
      <MovementEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {movements.items.map((movement) => {
          const category = categories.find(
            (item) => item.id === movement.id_category,
          );

          return (
            <MovementItem
              key={movement.id}
              movement={movement}
              categoryName={category?.cat_name ?? "Uncategorized"}
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
