import type { Category } from "@/types/category.types";
import type { MovementType } from "@/types/money-movement.types";
import type { Filters } from "@/features/dashboard/types";
import { inputClassName, selectClassName } from "@/features/dashboard/components/movement-form-fields";

type MovementFiltersProps = {
  filters: Filters;
  categories: Category[];
  fixedType?: MovementType;
  onChange: (filters: Filters) => void;
};

export function MovementFilters({
  filters,
  categories,
  fixedType,
  onChange,
}: MovementFiltersProps) {
  const visibleCategories = fixedType
    ? categories.filter((category) => category.cat_type === fixedType)
    : filters.movementType === "ALL"
      ? categories
      : categories.filter(
          (category) => category.cat_type === filters.movementType,
        );

  return (
    <div className="dash-panel mb-5 p-4">
      <div
        className={
          fixedType
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {!fixedType && (
          <div>
            <label
              htmlFor="filter-type"
              className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]"
            >
              Type
            </label>
            <select
              id="filter-type"
              value={filters.movementType}
              onChange={(event) => {
                const movementType = event.target.value as Filters["movementType"];
                const selectedCategory = categories.find(
                  (category) => category.id === filters.categoryId,
                );

                onChange({
                  ...filters,
                  movementType,
                  categoryId:
                    movementType !== "ALL" &&
                    selectedCategory?.cat_type !== movementType
                      ? ""
                      : filters.categoryId,
                  page: 1,
                });
              }}
              className={selectClassName}
            >
              <option value="ALL">All types</option>
              <option value="EXPENSE">Expenses</option>
              <option value="INCOME">Income</option>
              <option value="TRANSFERT">Transfers</option>
            </select>
          </div>
        )}
        <div>
          <label
            htmlFor="filter-category"
            className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]"
          >
            Category
          </label>
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(event) =>
              onChange({ ...filters, categoryId: event.target.value, page: 1 })
            }
            className={selectClassName}
          >
            <option value="">All categories</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.cat_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="filter-from"
            className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]"
          >
            From
          </label>
          <input
            id="filter-from"
            type="date"
            value={filters.loggedForFrom}
            onChange={(event) =>
              onChange({
                ...filters,
                loggedForFrom: event.target.value,
                page: 1,
              })
            }
            className={inputClassName}
          />
        </div>
        <div>
          <label
            htmlFor="filter-to"
            className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]"
          >
            To
          </label>
          <input
            id="filter-to"
            type="date"
            value={filters.loggedForTo}
            onChange={(event) =>
              onChange({ ...filters, loggedForTo: event.target.value, page: 1 })
            }
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
