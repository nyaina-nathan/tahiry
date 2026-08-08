"use client";

import { BalanceSection } from "@/features/dashboard/components/balance-section";
import { DashboardActionError } from "@/features/dashboard/components/dashboard-action-error";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardIntro } from "@/features/dashboard/components/dashboard-intro";
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
    isLoading,
    isListLoading,
    loadError,
    actionError,
    mutation,
    filters,
    editingId,
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
    beginEditing,
    handleSubmit,
    handleDelete,
    handleLogout,
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
    <main className="min-h-screen overflow-x-clip bg-[var(--color-canvas)]">
      <DashboardHeader
        isLoggingOut={mutation === "logout"}
        onLogout={() => void handleLogout()}
      />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <DashboardIntro user={user} />

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

            <div className="grid gap-12 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.5fr)] lg:gap-16">
              <MovementFormSection
                editingId={editingId}
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
                onFiltersChange={updateFilters}
                onBeginEditing={beginEditing}
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
            </div>

            <DashboardActionError message={actionError} />
          </>
        )}
      </div>
    </main>
  );
}
