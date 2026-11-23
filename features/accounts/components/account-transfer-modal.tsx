"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { AccountWithBalance } from "@/features/accounts/api/accounts-api";

type AccountTransferModalProps = {
  accounts: AccountWithBalance[];
  sourceId: string;
  destinationId: string;
  amount: string;
  reason: string;
  currency: string;
  error: string;
  isTransferring: boolean;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

const inputClassName =
  "min-h-12 w-full rounded-[0.7rem] border border-(--color-line) bg-(--color-surface) px-4 text-base text-(--color-ink) outline-none transition-colors placeholder:text-(--color-placeholder) focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20";
const selectClassName =
  "min-h-12 w-full rounded-[0.7rem] border border-(--color-line) bg-(--color-surface) px-4 text-sm font-medium text-(--color-ink) outline-none transition-colors focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20";

export function AccountTransferModal({
  accounts,
  sourceId,
  destinationId,
  amount,
  reason,
  currency,
  error,
  isTransferring,
  onSourceChange,
  onDestinationChange,
  onAmountChange,
  onReasonChange,
  onSubmit,
  onCancel,
}: AccountTransferModalProps) {
  const firstInputRef = useRef<HTMLSelectElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !isTransferring) {
      onCancel();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusables = [
      ...dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, select, a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ].filter(
      (element) =>
        !(element instanceof HTMLButtonElement && element.disabled) &&
        element.getAttribute("aria-disabled") !== "true",
    );

    if (focusables.length === 0) {
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      id="transfer-account-modal"
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-(--color-overlay) p-4 backdrop-blur-md sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-account-heading"
    >
      <div className="w-full max-w-xl rounded-[1.25rem] border border-(--color-line) bg-(--color-canvas) shadow-2xl">
        <div className="p-5 sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
            Move money between wallets
          </p>
          <h2
            id="transfer-account-heading"
            className="font-semibold text-3xl text-(--color-ink)"
          >
            Transfer
          </h2>
        </div>

        <form
          className="dash-panel m-5 mt-0 p-5 sm:m-6 sm:mt-0 sm:p-6"
          onSubmit={onSubmit}
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="transfer-source-account"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-ink)"
              >
                Source account
              </label>
              <select
                ref={firstInputRef}
                id="transfer-source-account"
                value={sourceId}
                onChange={(event) => onSourceChange(event.target.value)}
                required
                className={selectClassName}
              >
                <option value="" disabled>
                  Select an account
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} — {account.balance} {currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="transfer-destination-account"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-ink)"
              >
                Destination account
              </label>
              <select
                id="transfer-destination-account"
                value={destinationId}
                onChange={(event) => onDestinationChange(event.target.value)}
                required
                className={selectClassName}
              >
                <option value="" disabled>
                  Select an account
                </option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="transfer-amount"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-ink)"
              >
                Amount
              </label>
              <div className="relative">
                <input
                  id="transfer-amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max="99999999.99"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    onAmountChange(
                      event.target.value.startsWith("-")
                        ? ""
                        : event.target.value,
                    )
                  }
                  required
                  className={`${inputClassName} font-mono pr-16`}
                  placeholder="0.00"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[10px] font-bold uppercase text-(--color-muted)">
                  {currency}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="transfer-reason"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-ink)"
              >
                Reason
              </label>
              <input
                id="transfer-reason"
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
                maxLength={255}
                required
                className={inputClassName}
                placeholder="e.g. Moving money to savings"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-(--color-negative)">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isTransferring}
                className="flex min-h-13 flex-1 items-center justify-between rounded-[0.7rem] bg-(--color-strong) px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-(--color-accent) hover:text-(--color-accent-contrast) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-wait disabled:opacity-60"
              >
                <span>{isTransferring ? "Transferring..." : "Transfer money"}</span>
                <span aria-hidden="true" className="text-lg">
                  →
                </span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isTransferring}
                className="min-h-13 rounded-[0.7rem] border border-(--color-line) px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-ink) transition-colors hover:border-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
