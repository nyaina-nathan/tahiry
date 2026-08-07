import type { MovementType } from "@/types/money-movement.types";

type MovementTypeSelectorProps = {
  value: MovementType;
  onChange: (value: MovementType) => void;
};

export function MovementTypeSelector({
  value,
  onChange,
}: MovementTypeSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]">
        Movement type
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {(["EXPENSE", "INCOME"] as MovementType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={value === type}
            className={`min-h-12 border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] ${
              value === type
                ? type === "EXPENSE"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-secondary)] bg-[var(--color-secondary)] text-white"
                : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-ink)]"
            }`}
          >
            {type === "EXPENSE" ? "Expense" : "Income"}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
