"use client";

import { useState, type FormEvent } from "react";
import { downloadMoneyMovementsExport } from "@/features/dashboard/api/export-api";
import { MoneyMovementsExportModal } from "@/features/dashboard/components/money-movements-export-modal";

export function MoneyMovementsExportSection() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportError, setExportError] = useState("");

  function openExport() {
    setExportError("");
    setIsExportOpen(true);
  }

  function closeExport() {
    if (!isExporting) {
      setIsExportOpen(false);
    }
  }

  async function handleExport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (exportFrom && exportTo && exportFrom > exportTo) {
      setExportError("The start date cannot be after the end date.");
      return;
    }

    setExportError("");
    setIsExporting(true);

    try {
      await downloadMoneyMovementsExport({
        ...(exportFrom ? { from: exportFrom } : {}),
        ...(exportTo ? { to: exportTo } : {}),
      });
      setIsExportOpen(false);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "The Excel export could not be created.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section
      aria-labelledby="money-movements-export-heading"
      className="dash-panel w-full p-5 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-accent)">
            Your data
          </p>
          <h2
            id="money-movements-export-heading"
            className="font-display text-3xl text-(--color-ink) sm:text-4xl"
          >
            Export your movements.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-(--color-muted)">
            Download your money movements as an Excel workbook, with an
            optional date range.
          </p>
        </div>

        <button
          type="button"
          onClick={openExport}
          className="inline-flex min-h-11 items-center gap-3 rounded-[0.65rem] border border-(--color-strong) bg-(--color-strong) px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-(--color-accent) hover:bg-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)"
        >
          <span>Export in Excel</span>
          <span aria-hidden="true" className="text-base">
            ↓
          </span>
        </button>
      </div>

      {isExportOpen && (
        <MoneyMovementsExportModal
          from={exportFrom}
          to={exportTo}
          error={exportError}
          isExporting={isExporting}
          onFromChange={setExportFrom}
          onToChange={setExportTo}
          onSubmit={(event) => void handleExport(event)}
          onCancel={closeExport}
        />
      )}
    </section>
  );
}
