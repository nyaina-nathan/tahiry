import type { CategoryType } from "@/types/category.types";

export const inputClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

export const selectClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-medium outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

type CategoryFormFieldsProps = {
  nameId: string;
  typeId: string;
  name: string;
  type: CategoryType;
  namePlaceholder?: string;
  onNameChange: (name: string) => void;
  onTypeChange: (type: CategoryType) => void;
  autoFocus?: boolean;
  layout?: "stacked" | "inline";
};

export function CategoryFormFields({
  nameId,
  typeId,
  name,
  type,
  namePlaceholder,
  onNameChange,
  onTypeChange,
  autoFocus = false,
  layout = "inline",
}: CategoryFormFieldsProps) {
  return (
    <div
      className={
        layout === "inline"
          ? "grid gap-4 sm:grid-cols-[1fr_180px]"
          : "space-y-5"
      }
    >
      <div>
        <label
          htmlFor={nameId}
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Category name
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          maxLength={255}
          required
          autoFocus={autoFocus}
          placeholder={namePlaceholder}
          className={inputClassName}
        />
      </div>
      <div>
        <label
          htmlFor={typeId}
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Type
        </label>
        <select
          id={typeId}
          value={type}
          onChange={(event) => onTypeChange(event.target.value as CategoryType)}
          className={selectClassName}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </div>
    </div>
  );
}
