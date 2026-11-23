"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

type MoneyMovementsExportModalProps = {
  from: string;
  to: string;
  error: string;
  isExporting: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

const inputClassName =
  "min-h-12 w-full rounded-[0.7rem] border border-(--color-line) bg-(--color-surface) px-4 text-base text-(--color-ink) outline-none transition-colors focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent)/20";

export function MoneyMovementsExportModal({
  from,
  to,
  error,
  isExporting,
  onFromChange,
  onToChange,
  onSubmit,
  onCancel,
}: MoneyMovementsExportModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);
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
    if (event.key === "Escape" && !isExporting) {
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
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-(--color-overlay) p-4 backdrop-blur-md sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-movements-heading"
    >
      <div className="w-full max-w-xl rounded-[1.25rem] border border-(--color-line) bg-(--color-canvas) shadow-2xl">
        <div className="p-5 sm:p-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-accent)">
            Download your records
          </p>
          <h2
            id="export-movements-heading"
            className="font-semibold text-3xl text-(--color-ink)"
          >
            Export in Excel
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-(--color-muted)">
            Choose an optional date range. Leave both dates blank to export
            every money movement.
          </p>
        </div>

        <form
          className="dash-panel m-5 mt-0 p-5 sm:m-6 sm:mt-0 sm:p-6"
          onSubmit={onSubmit}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="export-from"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-ink)"
              >
                From
              </label>
              <input
                ref={firstInputRef}
                id="export-from"
                type="date"
                value={from}
                onChange={(event) => onFromChange(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label
                htmlFor="export-to"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-(--color-ink)"
              >
                To
              </label>
              <input
                id="export-to"
                type="date"
                value={to}
                onChange={(event) => onToChange(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-5 text-sm text-(--color-negative)">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isExporting}
              className="flex min-h-13 flex-1 items-center justify-between rounded-[0.7rem] bg-(--color-strong) px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-(--color-accent) hover:text-(--color-accent-contrast) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:cursor-wait disabled:opacity-60"
            >
              <span>{isExporting ? "Preparing..." : "Export in Excel"}</span>
              <span aria-hidden="true" className="text-lg">
                ↓
              </span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isExporting}
              className="min-h-13 rounded-[0.7rem] border border-(--color-line) px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-(--color-ink) transition-colors hover:border-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent) disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
