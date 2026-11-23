"use client";

import { useState } from "react";
import { AppHeader, PRIMARY_NAV_LINKS } from "@/components/app-header";
import type { MovementType } from "@/types/money-movement.types";
import type { Filters } from "@/features/dashboard/types";
import { DashboardActionError } from "@/features/dashboard/components/dashboard-action-error";
import { DashboardLoadError } from "@/features/dashboard/components/dashboard-load-error";
import { MovementFormSection } from "@/features/dashboard/components/movement-form-section";
import { MovementListSection } from "@/features/dashboard/components/movement-list-section";
import { formatDate } from "@/features/dashboard/utils/formatters";
import { resolveMovementRange } from "@/features/dashboard/utils/date-range";
import { MovementChartSection } from "@/features/movements/components/movement-chart-section";
import { useMoneyMovements } from "@/features/movements/hooks/use-money-movements";
import { useMovementDailyTotals } from "@/features/movements/hooks/use-movement-daily-totals";

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
    accounts,
    movements,
    isLoading,
    isListLoading,
    loadError,
    actionError,
    mutation,
    dataRevision,
    filters,
    editingId,
    isCreateFormOpen,
    formType,
    formTitle,
    formAmount,
    formCategoryId,
    formAccountId,
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
    setFormAccountId,
    setFormDescription,
    setFormLoggedFor,
    setPendingDeleteId,
  } = useMoneyMovements({ fixedType: type, withBalance: false });

  const [chartSpan, setChartSpan] = useState({ from: "", to: "" });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const chartRange = resolveMovementRange(chartSpan.from, chartSpan.to);
  const chart = useMovementDailyTotals({
    range: chartRange,
    movementType: type,
    categoryId: filters.categoryId,
    revision: dataRevision,
  });

  const copy = PAGE_COPY[type];
  const deletingId = mutation === "delete" ? pendingDeleteId : null;
  const emptyTitle = selectedDay
    ? `No ${type === "EXPENSE" ? "expenses" : "income"} on ${formatDate(selectedDay)}.`
    : copy.emptyTitle;
  const emptyDescription = selectedDay
    ? "Pick another day in the chart or clear the day filter."
    : copy.emptyDescription;

  function handleFiltersChange(nextFilters: Filters) {
    if (
      nextFilters.loggedForFrom !== filters.loggedForFrom ||
      nextFilters.loggedForTo !== filters.loggedForTo
    ) {
      setChartSpan({
        from: nextFilters.loggedForFrom,
        to: nextFilters.loggedForTo,
      });
      setSelectedDay(null);
    }

    updateFilters(nextFilters);
  }

  function handleSelectDay(day: string) {
    setSelectedDay(day);
    updateFilters({
      ...filters,
      loggedForFrom: day,
      loggedForTo: day,
      page: 1,
    });
  }

  function handleClearDay() {
    setSelectedDay(null);
    updateFilters({
      ...filters,
      loggedForFrom: chartSpan.from,
      loggedForTo: chartSpan.to,
      page: 1,
    });
  }

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
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
                  {copy.eyebrow}
                </p>
                <h1 className="font-bold text-5xl leading-none tracking-tight text-(--color-ink) sm:text-7xl">
                  {copy.heading}
                </h1>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-(--color-muted) sm:mt-0 sm:text-right">
                {copy.description}
              </p>
            </header>

            <MovementChartSection
              points={chart.points}
              currency={user.currency}
              movementType={type}
              range={chartRange}
              selectedDay={selectedDay}
              isLoading={chart.isLoading}
              error={chart.error}
              onSelectDay={handleSelectDay}
              onRetry={chart.refresh}
            />

            <MovementListSection
              movements={movements}
              categories={categories}
              accounts={accounts}
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
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              selectedDay={selectedDay}
              onClearSelectedDay={handleClearDay}
              onFiltersChange={handleFiltersChange}
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
              formAccountId={formAccountId}
              formDescription={formDescription}
              formLoggedFor={formLoggedFor}
              formError={formError}
              categories={categories}
              accounts={accounts}
              currency={user.currency}
              mutation={mutation}
              fixedType={type}
              onTypeChange={setFormType}
              onTitleChange={setFormTitle}
              onAmountChange={setFormAmount}
              onCategoryChange={setFormCategoryId}
              onAccountChange={setFormAccountId}
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
