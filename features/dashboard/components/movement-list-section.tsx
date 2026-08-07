import type { Category } from "@/types/category.types";
import type {
  MoneyMovement,
  MovementPage,
} from "@/types/money-movement.types";
import type { Filters } from "@/features/dashboard/types";
import { MovementFilters } from "@/features/dashboard/components/movement-filters";
import { MovementList } from "@/features/dashboard/components/movement-list";

type MovementListSectionProps = {
  movements: MovementPage | null;
  categories: Category[];
  currency: string;
  filters: Filters;
  totalPages: number;
  isLoading: boolean;
  isListLoading: boolean;
  pendingDeleteId: string | null;
  deletingId: string | null;
  onFiltersChange: (filters: Filters) => void;
  onBeginEditing: (movement: MoneyMovement) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function MovementListSection({
  movements,
  categories,
  currency,
  filters,
  totalPages,
  isLoading,
  isListLoading,
  pendingDeleteId,
  deletingId,
  onFiltersChange,
  onBeginEditing,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onPreviousPage,
  onNextPage,
}: MovementListSectionProps) {
  return (
    <section aria-labelledby="movements-heading">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-secondary)]">
            Your record
          </p>
          <h2 id="movements-heading" className="font-display text-3xl text-[var(--color-ink)]">
            Recent movements.
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {movements?.total ?? 0} total
        </span>
      </div>

      <MovementFilters
        filters={filters}
        categories={categories}
        onChange={onFiltersChange}
      />
      <MovementList
        movements={movements}
        categories={categories}
        currency={currency}
        totalPages={totalPages}
        isLoading={isLoading}
        isListLoading={isListLoading}
        pendingDeleteId={pendingDeleteId}
        deletingId={deletingId}
        onBeginEditing={onBeginEditing}
        onRequestDelete={onRequestDelete}
        onConfirmDelete={onConfirmDelete}
        onCancelDelete={onCancelDelete}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </section>
  );
}
