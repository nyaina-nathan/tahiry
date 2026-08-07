import type { FormEvent } from "react";
import type { CategoryType } from "@/types/category.types";
import { CategoryFormFields } from "@/features/categories/components/category-form-fields";

type CategoryCreateFormProps = {
  name: string;
  type: CategoryType;
  error: string;
  isCreating: boolean;
  onNameChange: (name: string) => void;
  onTypeChange: (type: CategoryType) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CategoryCreateForm({
  name,
  type,
  error,
  isCreating,
  onNameChange,
  onTypeChange,
  onSubmit,
}: CategoryCreateFormProps) {
  return (
    <section aria-labelledby="create-category-heading">
      <div className="mb-5">
        <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
          Add a new label
        </p>
        <h2
          id="create-category-heading"
          className="font-display text-3xl text-[var(--color-ink)]"
        >
          Create category
        </h2>
      </div>
      <form
        className="border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6"
        onSubmit={onSubmit}
      >
        <div className="space-y-5">
          <CategoryFormFields
            nameId="new-category-name"
            typeId="new-category-type"
            name={name}
            type={type}
            namePlaceholder="e.g. Groceries"
            onNameChange={onNameChange}
            onTypeChange={onTypeChange}
            layout="stacked"
          />
          {error && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isCreating}
            className="flex min-h-13 w-full items-center justify-between bg-[var(--color-ink)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait disabled:opacity-60"
          >
            <span>{isCreating ? "Creating..." : "Add category"}</span>
            <span aria-hidden="true" className="text-lg">
              +
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}
