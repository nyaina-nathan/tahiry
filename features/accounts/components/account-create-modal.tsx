"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

type AccountCreateModalProps = {
  name: string;
  error: string;
  isCreating: boolean;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

const inputClassName =
  "min-h-12 w-full rounded-[0.7rem] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

export function AccountCreateModal({
  name,
  error,
  isCreating,
  onNameChange,
  onSubmit,
  onCancel,
}: AccountCreateModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    nameInputRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !isCreating) {
      onCancel();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusables = [
      ...dialog.querySelectorAll<HTMLElement>(
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
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex min-h-[100dvh] items-start justify-center overflow-y-auto bg-(--color-overlay) p-4 backdrop-blur-md sm:items-center sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-account-heading"
    >
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-[1.25rem] border border-(--color-line) bg-(--color-canvas) shadow-2xl sm:max-h-[calc(100dvh-4rem)]">
        <section aria-labelledby="create-account-heading">
          <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
                Add a new wallet
              </p>
              <h2
                id="create-account-heading"
                className="font-semibold text-3xl text-(--color-ink)"
              >
                Create account
              </h2>
            </div>
          </div>
          <form
            className="dash-panel m-5 p-5 sm:m-6 sm:p-6"
            onSubmit={onSubmit}
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="new-account-name"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-ink)"
                >
                  Account name
                </label>
                <input
                  ref={nameInputRef}
                  id="new-account-name"
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  maxLength={50}
                  required
                  placeholder="e.g. Main checking"
                  className={inputClassName}
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
                  disabled={isCreating}
                  className="flex min-h-13 flex-1 items-center justify-between rounded-[0.7rem] bg-(--color-strong) px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-(--color-accent) hover:text-(--color-accent-contrast) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-wait disabled:opacity-60"
                >
                  <span>{isCreating ? "Creating..." : "Add account"}</span>
                  <span aria-hidden="true" className="text-lg">
                    +
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isCreating}
                  className="min-h-13 rounded-[0.7rem] border border-(--color-line) px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-ink) transition-colors hover:border-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
