import type { FormEvent } from "react";
import type { Category, CategoryType } from "@/types/category.types";
import { CategoryDeleteConfirmation } from "@/features/categories/components/category-delete-confirmation";
import { CategoryEditForm } from "@/features/categories/components/category-edit-form";

type CategoryItemProps = {
  category: Category;
  type: CategoryType;
  accentClassName: string;
  isEditing: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  isDeletingThis: boolean;
  editingName: string;
  editingType: CategoryType;
  editError: string;
  onBeginEditing: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onCancelEditing: () => void;
  onEditingNameChange: (name: string) => void;
  onEditingTypeChange: (type: CategoryType) => void;
  onUpdate: (event: FormEvent<HTMLFormElement>) => void;
};

export function CategoryItem({
  category,
  type,
  accentClassName,
  isEditing,
  isDeleting,
  isUpdating,
  isDeletingThis,
  editingName,
  editingType,
  editError,
  onBeginEditing,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onCancelEditing,
  onEditingNameChange,
  onEditingTypeChange,
  onUpdate,
}: CategoryItemProps) {
  return (
    <li className="dash-panel p-4 sm:p-5">
      {isEditing ? (
        <CategoryEditForm
          categoryId={category.id}
          name={editingName}
          type={editingType}
          error={editError}
          isUpdating={isUpdating}
          onNameChange={onEditingNameChange}
          onTypeChange={onEditingTypeChange}
          onSubmit={onUpdate}
          onCancel={onCancelEditing}
        />
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.85rem] font-display text-2xl text-white ${accentClassName}`}
              aria-hidden="true"
            >
              {category.cat_name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-[var(--color-ink)]">
                {category.cat_name}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                {type.toLowerCase()}
              </p>
            </div>
          </div>

          {isDeleting ? (
            <CategoryDeleteConfirmation
              isDeleting
              onConfirm={onConfirmDelete}
              onCancel={onCancelDelete}
              isDeletingThis={isDeletingThis}
            />
          ) : (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onBeginEditing}
                className="min-h-11 rounded-[0.65rem] border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onRequestDelete}
                className="min-h-11 rounded-[0.65rem] border border-[var(--color-negative-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-negative)] transition-colors hover:bg-[var(--color-negative-soft)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-negative)]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
