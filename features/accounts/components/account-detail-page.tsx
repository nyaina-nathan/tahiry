"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader, PRIMARY_NAV_LINKS } from "@/components/app-header";
import {
  fetchAccountsWorkspace,
  type AccountsWorkspace,
} from "@/features/accounts/api/accounts-api";
import { BalanceCard } from "@/features/dashboard/components/balance-card";
import { DashboardActionError } from "@/features/dashboard/components/dashboard-action-error";
import { DashboardLoadError } from "@/features/dashboard/components/dashboard-load-error";
import { MovementFormSection } from "@/features/dashboard/components/movement-form-section";
import { MovementListSection } from "@/features/dashboard/components/movement-list-section";
import { useMoneyMovements } from "@/features/movements/hooks/use-money-movements";

type AccountDetailPageProps = {
  accountId: string;
};

export function AccountDetailPage({ accountId }: AccountDetailPageProps) {
  const [workspace, setWorkspace] = useState<AccountsWorkspace | null>(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInitialWorkspace() {
      try {
        const data = await fetchAccountsWorkspace();

        if (!cancelled) {
          setWorkspace(data);
          setIsWorkspaceLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setWorkspaceError(
            error instanceof Error
              ? error.message
              : "The account could not be loaded.",
          );
          setIsWorkspaceLoading(false);
        }
      }
    }

    void loadInitialWorkspace();

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    user,
    balance,
    categories,
    accounts,
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
  } = useMoneyMovements({
    accountId,
    withBalance: true,
    withCashflow: false,
    initialPageSize: 10,
  });

  const account = workspace?.accounts.find((entry) => entry.id === accountId);
  const accountBalance = balance?.accounts.find(
    (entry) => entry.id_account === accountId,
  );
  const isPageLoading = isWorkspaceLoading || isLoading;
  const deletingId = mutation === "delete" ? pendingDeleteId : null;
  const backLink = (
    <Link
      href="/accounts"
      className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-muted) transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
    >
      ← All accounts
    </Link>
  );

  if (!isWorkspaceLoading && !workspaceError && !account) {
    return (
      <main className="min-h-screen bg-(--color-canvas)">
        <AppHeader links={PRIMARY_NAV_LINKS} />
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          {backLink}
          <div className="mt-8 border border-dashed border-(--color-line) px-6 py-14 text-center">
            <p className="font-display text-3xl text-(--color-ink)">
              Account not found.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-(--color-muted)">
              This account does not exist or is not owned by you.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-(--color-canvas)">
      <AppHeader links={PRIMARY_NAV_LINKS} />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        {workspaceError || loadError ? (
          <DashboardLoadError
            message={workspaceError || loadError}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <>
            <header className="mb-8 border-b border-(--color-line) pb-6">
              {backLink}
              <p className="mt-4 mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
                Account
              </p>
              <h1 className="font-display text-4xl leading-none tracking-tight text-(--color-ink) sm:text-6xl">
                {account?.name ?? "Account"}
              </h1>
            </header>

            <section aria-label="Account balances" className="mb-12">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <BalanceCard
                  label="Current balance"
                  value={accountBalance?.balance}
                  detail="Income minus expenses, transfers included"
                  className="bg-[var(--color-strong)] text-white"
                  mutedClassName="text-white/70"
                  currency={user.currency}
                  isLoading={isPageLoading}
                />
                <BalanceCard
                  label="Income"
                  value={accountBalance?.income}
                  detail="Money that moved in"
                  className="bg-[var(--color-positive)] text-white"
                  mutedClassName="text-white/70"
                  currency={user.currency}
                  isLoading={isPageLoading}
                />
                <BalanceCard
                  label="Expenses"
                  value={accountBalance?.expense}
                  detail="Money that moved out"
                  className="bg-[var(--color-negative-fill)] text-white"
                  mutedClassName="text-white/70"
                  currency={user.currency}
                  isLoading={isPageLoading}
                />
              </div>
            </section>

            <MovementListSection
              movements={movements}
              categories={categories}
              accounts={accounts}
              currency={user.currency}
              filters={filters}
              totalPages={totalPages}
              isLoading={isPageLoading}
              isListLoading={isListLoading}
              pendingDeleteId={pendingDeleteId}
              deletingId={deletingId}
              accountId={accountId}
              heading="Account movements."
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
              formAccountId={formAccountId}
              formDescription={formDescription}
              formLoggedFor={formLoggedFor}
              formError={formError}
              categories={categories}
              accounts={accounts}
              currency={user.currency}
              mutation={mutation}
              fixedAccountId={accountId}
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
