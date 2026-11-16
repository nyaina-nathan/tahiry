import type { Category } from "@/types/category.types";
import type { Account } from "@/types/account.types";
import type {
  MoneyMovement,
  MovementPage,
  MovementType,
} from "@/types/money-movement.types";
import type { Filters } from "@/features/dashboard/types";
import { MovementFilters } from "@/features/dashboard/components/movement-filters";
import { MovementList } from "@/features/dashboard/components/movement-list";
import { MovementPageSizeControl } from "@/features/dashboard/components/movement-page-size-control";

type MovementListSectionProps = {
  movements: MovementPage | null;
  categories: Category[];
  accounts: Account[];
  currency: string;
  filters: Filters;
  totalPages: number;
  isLoading: boolean;
  isListLoading: boolean;
  pendingDeleteId: string | null;
  deletingId: string | null;
  onFiltersChange: (filters: Filters) => void;
  onBeginEditing: (movement: MoneyMovement) => void;
  onCreateNewMovement: () => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  fixedType?: MovementType;
  accountId?: string;
  eyebrow?: string;
  heading?: string;
  createLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  showFilters?: boolean;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
};

export function MovementListSection({
  movements,
  categories,
  accounts,
  currency,
  filters,
  totalPages,
  isLoading,
  isListLoading,
  pendingDeleteId,
  deletingId,
  onFiltersChange,
  onBeginEditing,
  onCreateNewMovement,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onPreviousPage,
  onNextPage,
  fixedType,
  accountId,
  eyebrow = "Your record",
  heading = "Recent movements.",
  createLabel = "New +",
  emptyTitle,
  emptyDescription,
  showFilters = true,
  pageSize,
  onPageSizeChange,
}: MovementListSectionProps) {
  return (
    <section aria-labelledby="movements-heading">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            {eyebrow}
          </p>
          <h2 id="movements-heading" className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl">
            {heading}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {movements?.total ?? 0} total
          </span>
          <button
            type="button"
            onClick={onCreateNewMovement}
            className="min-h-10 bg-[var(--color-strong)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-contrast)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
          >
            {createLabel}
          </button>
        </div>
      </div>

      {showFilters ? (
        <MovementFilters
          filters={filters}
          categories={categories}
          fixedType={fixedType}
          onChange={onFiltersChange}
        />
      ) : null}
      {pageSize !== undefined && onPageSizeChange ? (
        <MovementPageSizeControl
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
      <MovementList
        movements={movements}
        categories={categories}
        accounts={accounts}
        currency={currency}
        totalPages={totalPages}
        isLoading={isLoading}
        isListLoading={isListLoading}
        pendingDeleteId={pendingDeleteId}
        deletingId={deletingId}
        accountId={accountId}
        onBeginEditing={onBeginEditing}
        onRequestDelete={onRequestDelete}
        onConfirmDelete={onConfirmDelete}
        onCancelDelete={onCancelDelete}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </section>
  );
}
