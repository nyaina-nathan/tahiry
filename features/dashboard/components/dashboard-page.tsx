"use client";

import { BalanceSection } from "@/features/dashboard/components/balance-section";
import { AppHeader, PRIMARY_NAV_LINKS } from "@/components/app-header";
import { CashflowSection } from "@/features/dashboard/components/cashflow-section";
import { DashboardActionError } from "@/features/dashboard/components/dashboard-action-error";
import { DashboardLoadError } from "@/features/dashboard/components/dashboard-load-error";
import { MovementFormSection } from "@/features/dashboard/components/movement-form-section";
import { MovementListSection } from "@/features/dashboard/components/movement-list-section";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";

export function DashboardPage() {
  const {
    user,
    balance,
    categories,
    movements,
    cashflow,
    isLoading,
    isListLoading,
    isCashflowLoading,
    loadError,
    actionError,
    cashflowError,
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
    refreshCashflow,
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
  } = useDashboard();

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
            <BalanceSection
              balance={balance}
              currency={user.currency}
              isLoading={isLoading}
            />

            <CashflowSection
              points={cashflow}
              currency={user.currency}
              isLoading={isLoading || isCashflowLoading}
              error={cashflowError}
              onRetry={() => void refreshCashflow()}
            />

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
              heading="Latest movements."
              showFilters={false}
              pageSize={filters.pageSize}
              onPageSizeChange={(pageSize) =>
                updateFilters({ ...filters, pageSize, page: 1 })
              }
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
