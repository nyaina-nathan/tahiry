import type { InputHTMLAttributes, ReactNode } from "react";

const inputClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

type AuthFieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id">;

export function AuthField({
  id,
  label,
  hint,
  inputClassName: additionalInputClassName,
  ...inputProps
}: AuthFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label
          className="block font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
          htmlFor={id}
        >
          {label}
        </label>
        {hint}
      </div>
      <input
        id={id}
        {...inputProps}
        className={`${inputClassName} ${additionalInputClassName ?? ""}`}
      />
    </div>
  );
}
