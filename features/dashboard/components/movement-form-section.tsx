import type { FormEvent } from "react";
import type { Category } from "@/types/category.types";
import type { MovementType } from "@/types/money-movement.types";
import type { Mutation } from "@/features/dashboard/types";
import { MovementFormActions } from "@/features/dashboard/components/movement-form-actions";
import { MovementFormFields } from "@/features/dashboard/components/movement-form-fields";

type MovementFormSectionProps = {
  editingId: string | null;
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
};

export function MovementFormSection({
  editingId,
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
}: MovementFormSectionProps) {
  return (
    <section aria-labelledby="movement-form-heading">
      <div className="mb-5">
        <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
          {editingId ? "Change a record" : "Log what happened"}
        </p>
        <h2 id="movement-form-heading" className="font-display text-3xl text-[var(--color-ink)]">
          {editingId ? "Edit movement" : "New movement"}
        </h2>
      </div>
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
    </section>
  );
}
