import type { Category } from "@/types/category.types";
import type { Account } from "@/types/account.types";
import type { MovementType } from "@/types/money-movement.types";
import { MovementTypeSelector } from "@/features/dashboard/components/movement-type-selector";

export const inputClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

export const selectClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-medium outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20";

type MovementFormFieldsProps = {
  type: MovementType;
  title: string;
  amount: string;
  categoryId: string;
  accountId: string;
  description: string;
  loggedFor: string;
  categories: Category[];
  accounts: Account[];
  currency: string;
  onTypeChange: (type: MovementType) => void;
  onTitleChange: (title: string) => void;
  onAmountChange: (amount: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onAccountChange: (accountId: string) => void;
  onDescriptionChange: (description: string) => void;
  onLoggedForChange: (loggedFor: string) => void;
  autoFocus?: boolean;
  hideTypeSelector?: boolean;
  accountLocked?: boolean;
};

export function MovementFormFields({
  type,
  title,
  amount,
  categoryId,
  accountId,
  description,
  loggedFor,
  categories,
  accounts,
  currency,
  onTypeChange,
  onTitleChange,
  onAmountChange,
  onCategoryChange,
  onAccountChange,
  onDescriptionChange,
  onLoggedForChange,
  autoFocus = false,
  hideTypeSelector = false,
  accountLocked = false,
}: MovementFormFieldsProps) {
  return (
    <div className="space-y-5">
      {!hideTypeSelector && (
        <MovementTypeSelector value={type} onChange={onTypeChange} />
      )}

      <div>
        <label
          htmlFor="movement-title"
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Title
        </label>
        <input
          id="movement-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={255}
          required
          autoFocus={autoFocus}
          className={inputClassName}
          placeholder="e.g. Weekly groceries"
        />
      </div>

      <div>
        <label
          htmlFor="movement-account"
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Account
        </label>
        <select
          id="movement-account"
          value={accountId}
          onChange={(event) => onAccountChange(event.target.value)}
          disabled={accountLocked}
          className={`${selectClassName} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <option value="">No account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        {accountLocked && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            The account cannot be changed after creation.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="movement-amount"
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Amount
        </label>
        <div className="relative">
          <input
            id="movement-amount"
            type="number"
            inputMode="decimal"
            min="0"
            max="99999999.99"
            step="0.01"
            value={amount}
            onChange={(event) =>
              onAmountChange(
                event.target.value.startsWith("-") ? "" : event.target.value,
              )
            }
            required
            className={`${inputClassName} pr-16`}
            placeholder="0.00"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-[10px] font-bold uppercase text-[var(--color-muted)]">
            {currency}
          </span>
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Amounts must be zero or greater.
        </p>
      </div>

      <div>
        <label
          htmlFor="movement-category"
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Category
        </label>
        <select
          id="movement-category"
          value={categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">No category</option>
          {categories
            .filter((category) => category.cat_type === type)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.cat_name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="movement-date"
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Logged date
        </label>
        <input
          id="movement-date"
          type="date"
          value={loggedFor}
          onChange={(event) => onLoggedForChange(event.target.value)}
          required
          className={inputClassName}
        />
      </div>

      <div>
        <label
          htmlFor="movement-description"
          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
        >
          Description{" "}
          <span className="font-normal normal-case tracking-normal text-[var(--color-muted)]">
            (optional)
          </span>
        </label>
        <textarea
          id="movement-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={3}
          className={`${inputClassName} py-3`}
          placeholder="Add a useful note"
        />
      </div>
    </div>
  );
}
