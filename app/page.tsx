"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/category.types";
import type {
  MoneyMovement,
  MovementPage,
  MovementType,
} from "@/types/money-movement.types";
import type { Balance } from "@/types/balance.types";

type CurrentUser = {
  currency: string;
  username: string;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type Filters = {
  movementType: MovementType | "ALL";
  categoryId: string;
  loggedForFrom: string;
  loggedForTo: string;
  page: number;
};

type Mutation = "create" | "update" | "delete" | "logout" | null;

const PAGE_SIZE = 25;
const inputClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";
const selectClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-medium outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getErrorMessage(response: Response, fallback: string) {
  return response
    .json()
    .catch(() => null)
    .then((data) => {
      const errorData = data as ApiErrorResponse | null;
      return errorData?.error?.message ?? fallback;
    });
}

async function fetchJson<T>(url: string, fallback: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback));
  }

  return (await response.json()) as T;
}

function buildMovementQuery(filters: Filters) {
  const params = new URLSearchParams({
    page: filters.page.toString(),
    page_size: PAGE_SIZE.toString(),
  });

  if (filters.movementType !== "ALL") {
    params.set("movement_type", filters.movementType);
  }
  if (filters.categoryId) {
    params.set("id_category", filters.categoryId);
  }
  if (filters.loggedForFrom) {
    params.set("logged_for_from", filters.loggedForFrom);
  }
  if (filters.loggedForTo) {
    params.set("logged_for_to", filters.loggedForTo);
  }

  return params.toString();
}

function formatMoney(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "MGA",
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency || "MGA"} ${amount}`;
  }
}

function formatDate(date: string | null) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser>({
    currency: "MGA",
    username: "there",
  });
  const [balance, setBalance] = useState<Balance | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<MovementPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [mutation, setMutation] = useState<Mutation>(null);

  const [filters, setFilters] = useState<Filters>({
    movementType: "ALL",
    categoryId: "",
    loggedForFrom: "",
    loggedForTo: "",
    page: 1,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<MovementType>("EXPENSE");
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLoggedFor, setFormLoggedFor] = useState(today);
  const [formError, setFormError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function fetchDashboardData(activeFilters: Filters) {
    const [currentUser, currentBalance, currentCategories, currentMovements] =
      await Promise.all([
        fetchJson<CurrentUser>("/api/auth/me", "Your session could not be loaded."),
        fetchJson<Balance>("/api/balance", "Balance could not be loaded."),
        fetchJson<Category[]>("/api/categories", "Categories could not be loaded."),
        fetchJson<MovementPage>(
          `/api/money-movements?${buildMovementQuery(activeFilters)}`,
          "Money movements could not be loaded.",
        ),
      ]);

    return {
      currentUser,
      currentBalance,
      currentCategories,
      currentMovements,
    };
  }

  async function refreshMovementsAndBalance(activeFilters: Filters) {
    setIsListLoading(true);
    setActionError("");

    try {
      const [currentBalance, currentMovements] = await Promise.all([
        fetchJson<Balance>("/api/balance", "Balance could not be loaded."),
        fetchJson<MovementPage>(
          `/api/money-movements?${buildMovementQuery(activeFilters)}`,
          "Money movements could not be loaded.",
        ),
      ]);

      setBalance(currentBalance);
      setMovements(currentMovements);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The dashboard could not be refreshed.",
      );
    } finally {
      setIsListLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await fetchDashboardData(filters);

        if (!cancelled) {
          setUser(data.currentUser);
          setBalance(data.currentBalance);
          setCategories(data.currentCategories);
          setMovements(data.currentMovements);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "The dashboard could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
    // The initial dashboard request must use the initial filter snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilters(nextFilters: Filters) {
    setFilters(nextFilters);
    void refreshMovementsAndBalance(nextFilters);
  }

  function resetForm() {
    setEditingId(null);
    setFormType("EXPENSE");
    setFormTitle("");
    setFormAmount("");
    setFormCategoryId("");
    setFormDescription("");
    setFormLoggedFor(today());
    setFormError("");
  }

  function beginEditing(movement: MoneyMovement) {
    setActionError("");
    setFormError("");
    setPendingDeleteId(null);
    setEditingId(movement.id);
    setFormType(movement.movement_type);
    setFormTitle(movement.title);
    setFormAmount(movement.amount);
    setFormCategoryId(movement.id_category ?? "");
    setFormDescription(movement.description ?? "");
    setFormLoggedFor(movement.logged_for ?? today());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateForm() {
    const title = formTitle.trim();
    const amount = formAmount.trim();

    if (!title) {
      return "Enter a title.";
    }

    if (!amount || !/^\d{1,8}(?:\.\d{1,2})?$/.test(amount)) {
      return "Enter a non-negative amount with up to 2 decimal places.";
    }

    if (Number(amount) < 0) {
      return "Negative amounts are not allowed.";
    }

    if (!formLoggedFor) {
      return "Choose a date.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");
    setActionError("");
    setMutation(editingId ? "update" : "create");

    const payload = {
      movement_type: formType,
      title: formTitle.trim(),
      amount: formAmount.trim(),
      id_category: formCategoryId || null,
      description: formDescription.trim() || null,
      logged_for: formLoggedFor || null,
    };

    try {
      const response = await fetch(
        editingId ? `/api/money-movements/${editingId}` : "/api/money-movements",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            editingId
              ? "Money movement could not be updated."
              : "Money movement could not be created.",
          ),
        );
      }

      resetForm();
      await refreshMovementsAndBalance(filters);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The money movement could not be saved.",
      );
    } finally {
      setMutation(null);
    }
  }

  async function handleDelete(id: string) {
    setMutation("delete");
    setActionError("");

    try {
      const response = await fetch(`/api/money-movements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Money movement could not be deleted."),
        );
      }

      if (editingId === id) {
        resetForm();
      }
      setPendingDeleteId(null);
      await refreshMovementsAndBalance(filters);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The money movement could not be deleted.",
      );
    } finally {
      setMutation(null);
    }
  }

  async function handleLogout() {
    setMutation("logout");

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch {
      setActionError("You could not be signed out. Please try again.");
      setMutation(null);
    }
  }

  const totalPages = movements
    ? Math.max(1, Math.ceil(movements.total / movements.page_size))
    : 1;

  return (
    <main className="min-h-screen bg-[var(--color-canvas)]">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
          >
            <span className="flex h-9 w-9 items-center justify-center bg-[var(--color-primary)] font-mono text-base font-bold text-white">
              P
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">
              Pennywise
            </span>
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/categories"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
            >
              Categories
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={mutation === "logout"}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60"
            >
              {mutation === "logout" ? "Signing out..." : "Sign out"}
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <section className="mb-10 flex flex-col gap-6 border-b border-[var(--color-line)] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              Personal money desk
            </p>
            <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-7xl">
              Your money, in motion.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              Welcome, {user.username}. Keep the full picture close and the
              next decision clear.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)] sm:text-right">
            Currency
            <span className="mt-2 block text-2xl font-bold tracking-normal text-[var(--color-ink)]">
              {user.currency}
            </span>
          </p>
        </section>

        {loadError ? (
          <section className="border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-5 py-5" role="alert">
            <p className="font-semibold text-[#812020]">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 min-h-11 border border-[#d98c8c] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#812020] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)]"
            >
              Try again
            </button>
          </section>
        ) : (
          <>
            <section aria-labelledby="balance-heading" className="mb-12">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    Lifetime view
                  </p>
                  <h2 id="balance-heading" className="font-display text-3xl text-[var(--color-ink)]">
                    The bottom line.
                  </h2>
                </div>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] sm:block">
                  Updated from every movement
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Current balance",
                    value: balance?.balance,
                    detail: "Income minus expenses",
                    className: "bg-[var(--color-ink)] text-white",
                    mutedClassName: "text-[#b7bdca]",
                  },
                  {
                    label: "Income",
                    value: balance?.income,
                    detail: "Money that moved in",
                    className: "bg-[var(--color-secondary)] text-white",
                    mutedClassName: "text-[#e3dafe]",
                  },
                  {
                    label: "Expenses",
                    value: balance?.expense,
                    detail: "Money that moved out",
                    className: "bg-[var(--color-primary)] text-white",
                    mutedClassName: "text-[#dbe4ff]",
                  },
                ].map((card) => (
                  <article key={card.label} className={`min-h-40 p-5 sm:p-6 ${card.className}`}>
                    <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${card.mutedClassName}`}>
                      {card.label}
                    </p>
                    {isLoading ? (
                      <div className="mt-5 h-9 w-40 animate-pulse bg-white/20" />
                    ) : (
                      <p className="mt-5 break-all text-3xl font-bold tracking-tight sm:text-4xl">
                        {formatMoney(card.value ?? "0.00", user.currency)}
                      </p>
                    )}
                    <p className={`mt-3 text-sm ${card.mutedClassName}`}>{card.detail}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="grid gap-12 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.5fr)] lg:gap-16">
              <section aria-labelledby="movement-form-heading">
                <div className="mb-5">
                  <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    {editingId ? "Change a record" : "Log what happened"}
                  </p>
                  <h2 id="movement-form-heading" className="font-display text-3xl text-[var(--color-ink)]">
                    {editingId ? "Edit movement" : "New movement"}
                  </h2>
                </div>
                <form
                  className="border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6"
                  onSubmit={(event) => void handleSubmit(event)}
                >
                  <div className="space-y-5">
                    <fieldset>
                      <legend className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        Movement type
                      </legend>
                      <div className="grid grid-cols-2 gap-2">
                        {(["EXPENSE", "INCOME"] as MovementType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormType(type)}
                            aria-pressed={formType === type}
                            className={`min-h-12 border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] ${
                              formType === type
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

                    <div>
                      <label htmlFor="movement-title" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        Title
                      </label>
                      <input
                        id="movement-title"
                        value={formTitle}
                        onChange={(event) => setFormTitle(event.target.value)}
                        maxLength={255}
                        required
                        className={inputClassName}
                        placeholder="e.g. Weekly groceries"
                      />
                    </div>

                    <div>
                      <label htmlFor="movement-amount" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]">
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
                          value={formAmount}
                          onChange={(event) =>
                            setFormAmount(
                              event.target.value.startsWith("-")
                                ? ""
                                : event.target.value,
                            )
                          }
                          required
                          className={`${inputClassName} pr-16`}
                          placeholder="0.00"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-[10px] font-bold uppercase text-[var(--color-muted)]">
                          {user.currency}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-muted)]">
                        Amounts must be zero or greater.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="movement-category" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        Category
                      </label>
                      <select
                        id="movement-category"
                        value={formCategoryId}
                        onChange={(event) => setFormCategoryId(event.target.value)}
                        className={selectClassName}
                      >
                        <option value="">No category</option>
                        {categories
                          .filter((category) => category.cat_type === formType)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.cat_name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="movement-date" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        Logged date
                      </label>
                      <input
                        id="movement-date"
                        type="date"
                        value={formLoggedFor}
                        onChange={(event) => setFormLoggedFor(event.target.value)}
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="movement-description" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        Description <span className="font-normal normal-case tracking-normal text-[var(--color-muted)]">(optional)</span>
                      </label>
                      <textarea
                        id="movement-description"
                        value={formDescription}
                        onChange={(event) => setFormDescription(event.target.value)}
                        rows={3}
                        className={`${inputClassName} py-3`}
                        placeholder="Add a useful note"
                      />
                    </div>

                    {formError && (
                      <p role="alert" className="text-sm text-[var(--color-danger)]">
                        {formError}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={mutation === "create" || mutation === "update"}
                        className="min-h-13 flex-1 bg-[var(--color-ink)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait disabled:opacity-60"
                      >
                        {mutation === "create"
                          ? "Saving..."
                          : mutation === "update"
                            ? "Updating..."
                            : editingId
                              ? "Save changes"
                              : "Add movement"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          disabled={mutation === "update"}
                          className="min-h-13 border border-[var(--color-line)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </section>

              <section aria-labelledby="movements-heading">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-secondary)]">
                      Your record
                    </p>
                    <h2 id="movements-heading" className="font-display text-3xl text-[var(--color-ink)]">
                      Recent movements.
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {movements?.total ?? 0} total
                  </span>
                </div>

                <div className="mb-5 border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label htmlFor="filter-type" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        Type
                      </label>
                      <select
                        id="filter-type"
                        value={filters.movementType}
                        onChange={(event) =>
                          updateFilters({
                            ...filters,
                            movementType: event.target.value as Filters["movementType"],
                            page: 1,
                          })
                        }
                        className={selectClassName}
                      >
                        <option value="ALL">All types</option>
                        <option value="EXPENSE">Expenses</option>
                        <option value="INCOME">Income</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="filter-category" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        Category
                      </label>
                      <select
                        id="filter-category"
                        value={filters.categoryId}
                        onChange={(event) =>
                          updateFilters({ ...filters, categoryId: event.target.value, page: 1 })
                        }
                        className={selectClassName}
                      >
                        <option value="">All categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.cat_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="filter-from" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        From
                      </label>
                      <input
                        id="filter-from"
                        type="date"
                        value={filters.loggedForFrom}
                        onChange={(event) =>
                          updateFilters({ ...filters, loggedForFrom: event.target.value, page: 1 })
                        }
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="filter-to" className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">
                        To
                      </label>
                      <input
                        id="filter-to"
                        type="date"
                        value={filters.loggedForTo}
                        onChange={(event) =>
                          updateFilters({ ...filters, loggedForTo: event.target.value, page: 1 })
                        }
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>

                {isListLoading || isLoading ? (
                  <div className="space-y-3" aria-label="Loading money movements">
                    {["one", "two", "three"].map((item) => (
                      <div key={item} className="h-24 animate-pulse border border-[var(--color-line)] bg-[var(--color-surface)]" />
                    ))}
                  </div>
                ) : movements?.items.length ? (
                  <>
                    <ul className="space-y-3">
                      {movements.items.map((movement) => {
                        const isDeleting = pendingDeleteId === movement.id;
                        const isDeletingThis = mutation === "delete" && isDeleting;
                        const isIncome = movement.movement_type === "INCOME";
                        const category = categories.find(
                          (item) => item.id === movement.id_category,
                        );

                        return (
                          <li key={movement.id} className="border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-start gap-4">
                                <span
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center font-display text-2xl text-white ${isIncome ? "bg-[var(--color-secondary)]" : "bg-[var(--color-primary)]"}`}
                                  aria-hidden="true"
                                >
                                  {isIncome ? "+" : "-"}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-lg font-semibold text-[var(--color-ink)]">
                                    {movement.title}
                                  </p>
                                  <p className="mt-1 truncate text-sm text-[var(--color-muted)]">
                                    {category?.cat_name ?? "Uncategorized"} · {formatDate(movement.logged_for)}
                                  </p>
                                  {movement.description && (
                                    <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
                                      {movement.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                                <p className={`font-mono text-lg font-bold ${isIncome ? "text-[var(--color-secondary)]" : "text-[var(--color-primary)]"}`}>
                                  {isIncome ? "+" : "-"}{formatMoney(movement.amount, user.currency)}
                                </p>
                                {isDeleting ? (
                                  <div className="flex items-center gap-2" role="group" aria-label={`Delete ${movement.title}`}>
                                    <button
                                      type="button"
                                      onClick={() => void handleDelete(movement.id)}
                                      disabled={isDeletingThis}
                                      className="min-h-10 bg-[var(--color-danger)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60"
                                    >
                                      {isDeletingThis ? "Deleting..." : "Confirm"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPendingDeleteId(null)}
                                      disabled={isDeletingThis}
                                      className="min-h-10 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
                                    >
                                      Keep
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => beginEditing(movement)}
                                      className="min-h-10 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPendingDeleteId(movement.id);
                                        setActionError("");
                                      }}
                                      className="min-h-10 border border-[#efbcbc] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-danger)] transition-colors hover:bg-[#fff1f1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)]"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {isDeleting && (
                              <p className="mt-3 border-l-2 border-[var(--color-danger)] pl-3 text-xs text-[#812020]">
                                This movement will be permanently removed.
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                        Page {movements.page} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={filters.page <= 1 || isListLoading}
                          onClick={() => updateFilters({ ...filters, page: filters.page - 1 })}
                          className="min-h-11 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={filters.page >= totalPages || isListLoading}
                          onClick={() => updateFilters({ ...filters, page: filters.page + 1 })}
                          className="min-h-11 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border border-dashed border-[var(--color-line)] px-6 py-14 text-center">
                    <p className="font-display text-3xl text-[var(--color-ink)]">No movements yet.</p>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                      Add a movement to see your financial picture take shape.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {actionError && (
              <p role="alert" className="mt-8 border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-4 py-3 text-sm text-[#812020]">
                {actionError}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
