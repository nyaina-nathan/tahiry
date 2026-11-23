import { useEffect, type FormEvent } from "react";
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
  onCancel: () => void;
};

export function CategoryCreateForm({
  name,
  type,
  error,
  isCreating,
  onNameChange,
  onTypeChange,
  onSubmit,
  onCancel,
}: CategoryCreateFormProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isCreating) {
        onCancel();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreating, onCancel]);

  return (
    <div
      id="create-category-form"
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-[var(--color-overlay)] p-4 backdrop-blur-md sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-category-heading"
    >
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[1.25rem] border border-[var(--color-line)] bg-[var(--color-canvas)] shadow-2xl sm:max-h-[calc(100vh-4rem)]">
        <section aria-labelledby="create-category-heading">
          <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                Add a new label
              </p>
              <h2
                id="create-category-heading"
                className="font-semibold text-3xl text-[var(--color-ink)]"
              >
                Create category
              </h2>
            </div>
          </div>
          <form
            className="dash-panel m-5 p-5 sm:m-6 sm:p-6"
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
                <p role="alert" className="text-sm text-[var(--color-negative)]">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex min-h-13 flex-1 items-center justify-between rounded-[0.7rem] bg-[var(--color-strong)] px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-contrast)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:cursor-wait disabled:opacity-60"
                >
                  <span>{isCreating ? "Creating..." : "Add category"}</span>
                  <span aria-hidden="true" className="text-lg">
                    +
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isCreating}
                  className="min-h-13 rounded-[0.7rem] border border-[var(--color-line)] px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
