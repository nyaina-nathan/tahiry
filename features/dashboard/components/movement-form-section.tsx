import { useEffect, type FormEvent } from "react";
import type { Category } from "@/types/category.types";
import type { MovementType } from "@/types/money-movement.types";
import type { Mutation } from "@/features/dashboard/types";
import { MovementFormActions } from "@/features/dashboard/components/movement-form-actions";
import { MovementFormFields } from "@/features/dashboard/components/movement-form-fields";

type MovementFormSectionProps = {
  editingId: string | null;
  isCreateFormOpen: boolean;
  formType: MovementType;
  formTitle: string;
  formAmount: string;
  formCategoryId: string;
  formDescription: string;
  formLoggedFor: string;
  formError: string;
  categories: Category[];
  currency: string;
  mutation: Mutation;
  onTypeChange: (type: MovementType) => void;
  onTitleChange: (title: string) => void;
  onAmountChange: (amount: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDescriptionChange: (description: string) => void;
  onLoggedForChange: (loggedFor: string) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  fixedType?: MovementType;
};

export function MovementFormSection({
  editingId,
  isCreateFormOpen,
  formType,
  formTitle,
  formAmount,
  formCategoryId,
  formDescription,
  formLoggedFor,
  formError,
  categories,
  currency,
  mutation,
  onTypeChange,
  onTitleChange,
  onAmountChange,
  onCategoryChange,
  onDescriptionChange,
  onLoggedForChange,
  onReset,
  onSubmit,
  fixedType,
}: MovementFormSectionProps) {
  const isDialogOpen = Boolean(editingId) || isCreateFormOpen;
  const typeLabel =
    fixedType === "EXPENSE"
      ? "expense"
      : fixedType === "INCOME"
        ? "income"
        : null;

  useEffect(() => {
    if (!editingId && !isCreateFormOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && mutation !== "update") {
        onReset();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingId, isCreateFormOpen, mutation, onReset]);

  const form = (
    <form
      className="border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6"
      onSubmit={onSubmit}
    >
      <MovementFormFields
        type={formType}
        title={formTitle}
        amount={formAmount}
        categoryId={formCategoryId}
        description={formDescription}
        loggedFor={formLoggedFor}
        categories={categories}
        currency={currency}
        onTypeChange={onTypeChange}
        onTitleChange={onTitleChange}
        onAmountChange={onAmountChange}
        onCategoryChange={onCategoryChange}
        onDescriptionChange={onDescriptionChange}
        onLoggedForChange={onLoggedForChange}
        autoFocus={isDialogOpen}
        hideTypeSelector={Boolean(fixedType)}
      />
      {formError && (
        <p role="alert" className="mt-5 text-sm text-[var(--color-danger)]">
          {formError}
        </p>
      )}
      <div className="mt-5">
        <MovementFormActions
          mutation={mutation}
          editingId={editingId}
          onReset={onReset}
        />
      </div>
    </form>
  );

  if (!isDialogOpen) {
    return null;
  }

  const isEditing = Boolean(editingId);

  return (
    <div
      id={isEditing ? "movement-edit-dialog" : "movement-create-dialog"}
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(17,24,39,0.55)] p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-form-heading"
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto border border-[var(--color-line)] bg-[var(--color-canvas)] shadow-2xl sm:max-h-[calc(100vh-4rem)]">
          <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                {isEditing ? "Change a record" : "Log what happened"}
              </p>
              <h2
                id="movement-form-heading"
                className="font-display text-2xl text-[var(--color-ink)] sm:text-3xl"
              >
                {typeLabel
                  ? `${isEditing ? "Edit" : "New"} ${typeLabel}`
                  : isEditing
                    ? "Edit movement"
                    : "New movement"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onReset}
              disabled={mutation === "update"}
              aria-label={
                isEditing
                  ? "Close edit movement dialog"
                  : "Close new movement dialog"
              }
              className="min-h-10 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
            >
              Close
            </button>
          </div>
          <div className="p-5 pt-5 sm:p-6 sm:pt-5">{form}</div>
        </div>
      </div>
    </div>
  );
}
