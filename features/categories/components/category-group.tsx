import type { FormEvent } from "react";
import type { Category, CategoryType } from "@/types/category.types";
import { CategoryItem } from "@/features/categories/components/category-item";

type CategoryGroupProps = {
  type: CategoryType;
  title: string;
  description: string;
  accentClassName: string;
  categories: Category[];
  editingId: string | null;
  pendingDeleteId: string | null;
  updatingId: string | null;
  deletingId: string | null;
  editingName: string;
  editingType: CategoryType;
  editError: string;
  onBeginEditing: (category: Category) => void;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onCancelEditing: () => void;
  onEditingNameChange: (name: string) => void;
  onEditingTypeChange: (type: CategoryType) => void;
  onUpdate: (event: FormEvent<HTMLFormElement>, id: string) => void;
}

export function CategoryGroup({
  type,
  title,
  description,
  accentClassName,
  categories,
  editingId,
  pendingDeleteId,
  updatingId,
  deletingId,
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
}: CategoryGroupProps) {
  const group = categories.filter((category) => category.cat_type === type);

  return (
    <section aria-labelledby={`${type.toLowerCase()}-heading`}>
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-[var(--color-line)] pb-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${accentClassName}`}
              aria-hidden="true"
            />
            <h2
              id={`${type.toLowerCase()}-heading`}
              className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-ink)]"
            >
              {title}
            </h2>
          </div>
          <p className="text-sm text-[var(--color-muted)]">{description}</p>
        </div>
        <span className="text-xs font-mono text-[var(--color-muted)]">
          {group.length.toString().padStart(2, "0")}
        </span>
      </div>

      {group.length === 0 ? (
        <div className="dash-panel dash-panel-dashed px-5 py-8 text-center">
          <p className="font-semibold text-2xl text-[var(--color-ink)]">
            Nothing here yet.
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Add your first {type.toLowerCase()} category above.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {group.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              type={type}
              accentClassName={accentClassName}
              isEditing={editingId === category.id}
              isDeleting={pendingDeleteId === category.id}
              isUpdating={updatingId === category.id}
              isDeletingThis={deletingId === category.id}
              editingName={editingName}
              editingType={editingType}
              editError={editError}
              onBeginEditing={() => onBeginEditing(category)}
              onRequestDelete={() => onRequestDelete(category.id)}
              onConfirmDelete={() => onConfirmDelete(category.id)}
              onCancelDelete={onCancelDelete}
              onCancelEditing={onCancelEditing}
              onEditingNameChange={onEditingNameChange}
              onEditingTypeChange={onEditingTypeChange}
              onUpdate={(event) => onUpdate(event, category.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
