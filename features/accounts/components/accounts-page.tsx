"use client";

import { useState } from "react";
import { AppHeader, PRIMARY_NAV_LINKS } from "@/components/app-header";
import { AccountCard } from "@/features/accounts/components/account-card";
import { AccountCreateModal } from "@/features/accounts/components/account-create-modal";
import { AccountTransferModal } from "@/features/accounts/components/account-transfer-modal";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";

const ACCOUNT_SKELETON_COUNT = 3;

export function AccountsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const {
    accounts,
    currency,
    isLoading,
    loadError,
    loadAccounts,
    newName,
    setNewName,
    createError,
    isCreating,
    handleCreate,
    transferSourceId,
    setTransferSourceId,
    transferDestinationId,
    setTransferDestinationId,
    transferAmount,
    setTransferAmount,
    transferReason,
    setTransferReason,
    transferError,
    isTransferring,
    handleTransfer,
    resetTransferForm,
  } = useAccounts();

  return (
    <main className="min-h-screen bg-(--color-canvas)">
      <AppHeader links={PRIMARY_NAV_LINKS} />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-6 border-b border-(--color-line) pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
              Accounts
            </p>
            <h1 className="font-display text-5xl leading-none tracking-tight text-(--color-ink) sm:text-7xl">
              Your accounts.
            </h1>
          </div>
          <div className="flex items-end gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-(--color-muted) sm:text-right">
            <div>
              <span className="block text-3xl font-bold tracking-normal text-(--color-ink)">
                {accounts.length.toString().padStart(2, "0")}
              </span>
              accounts total
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowTransferForm(true)}
                aria-expanded={showTransferForm}
                aria-controls="transfer-account-modal"
                className="flex min-h-10 items-center justify-between gap-5 border border-(--color-line) px-3 text-(--color-ink) transition-colors hover:border-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
              >
                <span>Transfer</span>
                <span aria-hidden="true" className="text-lg leading-none">
                  →
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                aria-expanded={showCreateForm}
                aria-controls="create-account-modal"
                className="flex min-h-10 items-center justify-between gap-5 border border-(--color-line) px-3 text-(--color-ink) transition-colors hover:border-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
              >
                <span>New account</span>
                <span aria-hidden="true" className="text-lg leading-none">
                  +
                </span>
              </button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <AccountCreateModal
            name={newName}
            error={createError}
            isCreating={isCreating}
            onNameChange={setNewName}
            onSubmit={async (event) => {
              const created = await handleCreate(event);

              if (created) {
                setShowCreateForm(false);
              }
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {showTransferForm && (
          <AccountTransferModal
            accounts={accounts}
            sourceId={transferSourceId}
            destinationId={transferDestinationId}
            amount={transferAmount}
            reason={transferReason}
            currency={currency}
            error={transferError}
            isTransferring={isTransferring}
            onSourceChange={setTransferSourceId}
            onDestinationChange={setTransferDestinationId}
            onAmountChange={setTransferAmount}
            onReasonChange={setTransferReason}
            onSubmit={async (event) => {
              const transferred = await handleTransfer(event);

              if (transferred) {
                setShowTransferForm(false);
              }
            }}
            onCancel={() => {
              setShowTransferForm(false);
              resetTransferForm();
            }}
          />
        )}

        <div aria-live="polite">
          {isLoading ? (
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
              aria-label="Loading accounts"
            >
              {Array.from({ length: ACCOUNT_SKELETON_COUNT }, (_, index) => (
                <article
                  key={index}
                  className="border border-(--color-line) bg-(--color-surface) p-3 sm:p-5"
                  aria-hidden="true"
                >
                  <div className="h-2.5 w-20 animate-pulse bg-(--color-canvas)" />
                  <div className="mt-2 h-4 w-full animate-pulse bg-(--color-canvas) sm:mt-5 sm:h-6 sm:w-28" />
                </article>
              ))}
            </div>
          ) : loadError ? (
            <div
              className="border-l-4 border-(--color-negative) bg-(--color-negative-soft) px-5 py-5"
              role="alert"
            >
              <p className="font-semibold text-(--color-negative-strong)">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => void loadAccounts()}
                className="mt-4 min-h-11 border border-(--color-negative-line) px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-negative-strong) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-negative)"
              >
                Try again
              </button>
            </div>
          ) : accounts.length === 0 ? (
            <div className="border border-dashed border-(--color-line) px-6 py-14 text-center">
              <p className="font-display text-3xl text-(--color-ink)">
                No accounts yet.
              </p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-(--color-muted)">
                Add an account to start tracking where your money lives.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
