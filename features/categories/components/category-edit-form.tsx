import type { FormEvent } from "react";
import type { CategoryType } from "@/types/category.types";
import { CategoryFormFields } from "@/features/categories/components/category-form-fields";

type CategoryEditFormProps = {
  categoryId: string;
  name: string;
  type: CategoryType;
  error: string;
  isUpdating: boolean;
  onNameChange: (name: string) => void;
  onTypeChange: (type: CategoryType) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export function CategoryEditForm({
  categoryId,
  name,
  type,
  error,
  isUpdating,
  onNameChange,
  onTypeChange,
  onSubmit,
  onCancel,
}: CategoryEditFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <CategoryFormFields
        nameId={`edit-name-${categoryId}`}
        typeId={`edit-type-${categoryId}`}
        name={name}
        type={type}
        onNameChange={onNameChange}
        onTypeChange={onTypeChange}
        autoFocus
      />
      {error && (
        <p role="alert" className="text-sm text-[var(--color-negative)]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isUpdating}
          className="min-h-11 rounded-[0.7rem] bg-[var(--color-strong)] px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-contrast)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:cursor-wait disabled:opacity-60"
        >
          {isUpdating ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isUpdating}
          className="min-h-11 rounded-[0.7rem] border border-[var(--color-line)] px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
