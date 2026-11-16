"use client";

import { AppHeader, PRIMARY_NAV_LINKS } from "@/components/app-header";
import type { MovementType } from "@/types/money-movement.types";
import { DashboardActionError } from "@/features/dashboard/components/dashboard-action-error";
import { DashboardLoadError } from "@/features/dashboard/components/dashboard-load-error";
import { MovementFormSection } from "@/features/dashboard/components/movement-form-section";
import { MovementListSection } from "@/features/dashboard/components/movement-list-section";
import { useMoneyMovements } from "@/features/movements/hooks/use-money-movements";

type MovementsPageProps = {
  type: Exclude<MovementType, "TRANSFERT">;
};

type PageCopy = {
  eyebrow: string;
  heading: string;
  description: string;
  listHeading: string;
  createLabel: string;
  emptyTitle: string;
  emptyDescription: string;
};

const PAGE_COPY: Record<Exclude<MovementType, "TRANSFERT">, PageCopy> = {
  EXPENSE: {
    eyebrow: "Money out",
    heading: "Expenses.",
    description: "Every expense, in one place.",
    listHeading: "All expenses.",
    createLabel: "New expense",
    emptyTitle: "No expenses yet.",
    emptyDescription:
      "Log an expense to see where your money goes.",
  },
  INCOME: {
    eyebrow: "Money in",
    heading: "Income.",
    description: "Every income, in one place.",
    listHeading: "All income.",
    createLabel: "New income",
    emptyTitle: "No income yet.",
    emptyDescription: "Log income to see what you have coming in.",
  },
};

export function MovementsPage({ type }: MovementsPageProps) {
  const {
    user,
    categories,
    movements,
    isLoading,
    isListLoading,
    loadError,
    actionError,
    mutation,
    filters,
    editingId,
    isCreateFormOpen,
    formType,
    formTitle,
    formAmount,
    formCategoryId,
    formDescription,
    formLoggedFor,
    formError,
    pendingDeleteId,
    totalPages,
    updateFilters,
    resetForm,
    beginCreating,
    beginEditing,
    handleSubmit,
    handleDelete,
    requestDelete,
    setFormType,
    setFormTitle,
    setFormAmount,
    setFormCategoryId,
    setFormDescription,
    setFormLoggedFor,
    setPendingDeleteId,
  } = useMoneyMovements({ fixedType: type, withBalance: false });

  const copy = PAGE_COPY[type];
  const deletingId = mutation === "delete" ? pendingDeleteId : null;

  return (
    <main className="min-h-screen overflow-x-clip bg-(--color-canvas)">
      <AppHeader links={PRIMARY_NAV_LINKS} />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        {loadError ? (
          <DashboardLoadError
            message={loadError}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <>
            <header className="mb-10 border-b border-(--color-line) pb-8 sm:flex sm:items-end sm:justify-between sm:gap-8">
              <div>
                <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
                  {copy.eyebrow}
                </p>
                <h1 className="font-display text-5xl leading-none tracking-tight text-(--color-ink) sm:text-7xl">
                  {copy.heading}
                </h1>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-(--color-muted) sm:mt-0 sm:text-right">
                {copy.description}
              </p>
            </header>

            <MovementListSection
              movements={movements}
              categories={categories}
              currency={user.currency}
              filters={filters}
              totalPages={totalPages}
              isLoading={isLoading}
              isListLoading={isListLoading}
              pendingDeleteId={pendingDeleteId}
              deletingId={deletingId}
              fixedType={type}
              heading={copy.listHeading}
              createLabel={copy.createLabel}
              emptyTitle={copy.emptyTitle}
              emptyDescription={copy.emptyDescription}
              onFiltersChange={updateFilters}
              onBeginEditing={beginEditing}
              onCreateNewMovement={beginCreating}
              onRequestDelete={requestDelete}
              onConfirmDelete={(id) => void handleDelete(id)}
              onCancelDelete={() => setPendingDeleteId(null)}
              onPreviousPage={() =>
                updateFilters({ ...filters, page: filters.page - 1 })
              }
              onNextPage={() =>
                updateFilters({ ...filters, page: filters.page + 1 })
              }
            />

            <MovementFormSection
              editingId={editingId}
              isCreateFormOpen={isCreateFormOpen}
              formType={formType}
              formTitle={formTitle}
              formAmount={formAmount}
              formCategoryId={formCategoryId}
              formDescription={formDescription}
              formLoggedFor={formLoggedFor}
              formError={formError}
              categories={categories}
              currency={user.currency}
              mutation={mutation}
              fixedType={type}
              onTypeChange={setFormType}
              onTitleChange={setFormTitle}
              onAmountChange={setFormAmount}
              onCategoryChange={setFormCategoryId}
              onDescriptionChange={setFormDescription}
              onLoggedForChange={setFormLoggedFor}
              onReset={resetForm}
              onSubmit={(event) => void handleSubmit(event)}
            />

            <DashboardActionError message={actionError} />
          </>
        )}
      </div>
    </main>
  );
}
