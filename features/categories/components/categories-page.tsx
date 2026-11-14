"use client";

import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import {
  CategoriesActionError,
  CategoriesEmptyState,
  CategoriesLoadError,
  CategoriesLoading,
} from "@/features/categories/components/categories-feedback";
import { CategoriesIntro } from "@/features/categories/components/categories-intro";
import { CategoryCreateForm } from "@/features/categories/components/category-create-form";
import { CategoryGroups } from "@/features/categories/components/category-groups";
import { useCategories } from "@/features/categories/hooks/use-categories";

export function CategoriesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    categories,
    isLoading,
    loadError,
    actionError,
    mutation,
    newName,
    newType,
    createError,
    editingId,
    editingName,
    editingType,
    editError,
    pendingDeleteId,
    hasCategories,
    setNewName,
    setNewType,
    setEditingName,
    setEditingType,
    setPendingDeleteId,
    loadCategories,
    handleCreate,
    beginEditing,
    cancelEditing,
    handleUpdate,
    handleDelete,
    requestDelete,
  } = useCategories();

  const updatingId = mutation?.type === "update" ? mutation.id : null;
  const deletingId = mutation?.type === "delete" ? mutation.id : null;

  return (
    <main className="min-h-screen bg-(--color-canvas)">
      <AppHeader links={[{ href: "/", label: "Back to overview" }]} />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <CategoriesIntro
          categoryCount={categories.length}
          onCreateCategory={() => setShowCreateForm(true)}
          isCreateFormOpen={showCreateForm}
        />

        <div
          className={
            showCreateForm
              ? "mb-12 grid gap-10 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.5fr)] lg:gap-16"
              : "mb-12"
          }
        >
          {showCreateForm && (
            <CategoryCreateForm
              name={newName}
              type={newType}
              error={createError}
              isCreating={mutation?.type === "create"}
              onNameChange={setNewName}
              onTypeChange={setNewType}
              onSubmit={async (event) => {
                const created = await handleCreate(event);

                if (created) {
                  setShowCreateForm(false);
                }
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          <div aria-live="polite">
            {isLoading ? (
              <CategoriesLoading />
            ) : loadError ? (
              <CategoriesLoadError
                message={loadError}
                onRetry={() => void loadCategories()}
              />
            ) : !hasCategories ? (
              <CategoriesEmptyState />
            ) : null}
          </div>
        </div>

        {!isLoading && !loadError && hasCategories && (
          <CategoryGroups
            categories={categories}
            editingId={editingId}
            pendingDeleteId={pendingDeleteId}
            updatingId={updatingId}
            deletingId={deletingId}
            editingName={editingName}
            editingType={editingType}
            editError={editError}
            onBeginEditing={beginEditing}
            onRequestDelete={requestDelete}
            onConfirmDelete={(id) => void handleDelete(id)}
            onCancelDelete={() => setPendingDeleteId(null)}
            onCancelEditing={cancelEditing}
            onEditingNameChange={setEditingName}
            onEditingTypeChange={setEditingType}
            onUpdate={(event, id) => void handleUpdate(event, id)}
          />
        )}

        <CategoriesActionError message={actionError} />
      </div>
    </main>
  );
}
