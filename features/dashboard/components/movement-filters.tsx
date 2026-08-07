import type { Category } from "@/types/category.types";
import type { Filters } from "@/features/dashboard/types";
import { inputClassName, selectClassName } from "@/features/dashboard/components/movement-form-fields";

type MovementFiltersProps = {
  filters: Filters;
  categories: Category[];
  onChange: (filters: Filters) => void;
};

export function MovementFilters({
  filters,
  categories,
  onChange,
}: MovementFiltersProps) {
  return (
    <div className="mb-5 border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            onChange={(event) =>
              onChange({
                ...filters,
                movementType: event.target.value as Filters["movementType"],
                page: 1,
              })
            }
            className={selectClassName}
          >
            <option value="ALL">All types</option>
            <option value="EXPENSE">Expenses</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
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
            {categories.map((category) => (
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
