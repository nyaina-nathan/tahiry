import type { FormEvent } from "react";
import type { Category, CategoryType } from "@/types/category.types";
import { CategoryGroup } from "@/features/categories/components/category-group";

type CategoryGroupsProps = {
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
};

export function CategoryGroups({
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
}: CategoryGroupsProps) {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <CategoryGroup
        type="EXPENSE"
        title="Expenses"
        description="Money that moves out."
        accentClassName="bg-[var(--color-negative-fill)]"
        categories={categories}
        editingId={editingId}
        pendingDeleteId={pendingDeleteId}
        updatingId={updatingId}
        deletingId={deletingId}
        editingName={editingName}
        editingType={editingType}
        editError={editError}
        onBeginEditing={onBeginEditing}
        onRequestDelete={onRequestDelete}
        onConfirmDelete={onConfirmDelete}
        onCancelDelete={onCancelDelete}
        onCancelEditing={onCancelEditing}
        onEditingNameChange={onEditingNameChange}
        onEditingTypeChange={onEditingTypeChange}
        onUpdate={onUpdate}
      />
      <CategoryGroup
        type="INCOME"
        title="Income"
        description="Money that moves in."
        accentClassName="bg-[var(--color-positive)]"
        categories={categories}
        editingId={editingId}
        pendingDeleteId={pendingDeleteId}
        updatingId={updatingId}
        deletingId={deletingId}
        editingName={editingName}
        editingType={editingType}
        editError={editError}
        onBeginEditing={onBeginEditing}
        onRequestDelete={onRequestDelete}
        onConfirmDelete={onConfirmDelete}
        onCancelDelete={onCancelDelete}
        onCancelEditing={onCancelEditing}
        onEditingNameChange={onEditingNameChange}
        onEditingTypeChange={onEditingTypeChange}
        onUpdate={onUpdate}
      />
    </div>
  );
}
