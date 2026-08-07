"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Category, CategoryType } from "@/types/category.types";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type Mutation =
  | { type: "create" }
  | { type: "update"; id: string }
  | { type: "delete"; id: string }
  | null;

const inputClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-base outline-none transition-colors placeholder:text-[#9ba2b0] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

const selectClassName =
  "min-h-12 w-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-medium outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) =>
    a.cat_name.localeCompare(b.cat_name) || a.id.localeCompare(b.id),
  );
}

async function getErrorMessage(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as
    | ApiErrorResponse
    | null;

  return data?.error?.message ?? fallback;
}

async function fetchCategories() {
  const response = await fetch("/api/categories");

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Categories could not be loaded."),
    );
  }

  return sortCategories((await response.json()) as Category[]);
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [mutation, setMutation] = useState<Mutation>(null);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CategoryType>("EXPENSE");
  const [createError, setCreateError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingType, setEditingType] = useState<CategoryType>("EXPENSE");
  const [editError, setEditError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function loadCategories() {
    setIsLoading(true);
    setLoadError("");

    try {
      setCategories(await fetchCategories());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Categories could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCategories() {
      try {
        const data = await fetchCategories();

        if (!cancelled) {
          setCategories(data);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Categories could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();

    if (!name) {
      setCreateError("Enter a category name.");
      return;
    }

    setCreateError("");
    setActionError("");
    setMutation({ type: "create" });

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cat_name: name, cat_type: newType }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Category could not be created."),
        );
      }

      const category = (await response.json()) as Category;
      setCategories((current) => sortCategories([...current, category]));
      setNewName("");
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : "Category could not be created.",
      );
    } finally {
      setMutation(null);
    }
  }

  function beginEditing(category: Category) {
    setActionError("");
    setEditError("");
    setPendingDeleteId(null);
    setEditingId(category.id);
    setEditingName(category.cat_name);
    setEditingType(category.cat_type);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
    setEditError("");
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const name = editingName.trim();

    if (!name) {
      setEditError("Enter a category name.");
      return;
    }

    setEditError("");
    setActionError("");
    setMutation({ type: "update", id });

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cat_name: name, cat_type: editingType }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Category could not be updated."),
        );
      }

      const updatedCategory = (await response.json()) as Category;
      setCategories((current) =>
        sortCategories(
          current.map((category) =>
            category.id === id ? updatedCategory : category,
          ),
        ),
      );
      cancelEditing();
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Category could not be updated.",
      );
    } finally {
      setMutation(null);
    }
  }

  async function handleDelete(id: string) {
    setActionError("");
    setMutation({ type: "delete", id });

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "Category could not be deleted."),
        );
      }

      setCategories((current) => current.filter((category) => category.id !== id));
      setPendingDeleteId(null);
      if (editingId === id) {
        cancelEditing();
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Category could not be deleted.",
      );
    } finally {
      setMutation(null);
    }
  }

  function renderCategoryGroup(
    type: CategoryType,
    title: string,
    description: string,
    accentClassName: string,
  ) {
    const group = categories.filter((category) => category.cat_type === type);

    return (
      <section aria-labelledby={`${type.toLowerCase()}-heading`}>
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-[var(--color-line)] pb-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 ${accentClassName}`} aria-hidden="true" />
              <h2
                id={`${type.toLowerCase()}-heading`}
                className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-ink)]"
              >
                {title}
              </h2>
            </div>
            <p className="text-sm text-[var(--color-muted)]">{description}</p>
          </div>
          <span className="font-mono text-xs text-[var(--color-muted)]">
            {group.length.toString().padStart(2, "0")}
          </span>
        </div>

        {group.length === 0 ? (
          <div className="border border-dashed border-[var(--color-line)] px-5 py-8 text-center">
            <p className="font-display text-2xl text-[var(--color-ink)]">
              Nothing here yet.
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Add your first {type.toLowerCase()} category above.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {group.map((category) => {
              const isEditing = editingId === category.id;
              const isDeleting = pendingDeleteId === category.id;
              const isUpdating =
                mutation?.type === "update" && mutation.id === category.id;
              const isDeletingThis =
                mutation?.type === "delete" && mutation.id === category.id;

              return (
                <li
                  key={category.id}
                  className="border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-5"
                >
                  {isEditing ? (
                    <form
                      className="space-y-4"
                      onSubmit={(event) => void handleUpdate(event, category.id)}
                    >
                      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                        <div>
                          <label
                            htmlFor={`edit-name-${category.id}`}
                            className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                          >
                            Category name
                          </label>
                          <input
                            id={`edit-name-${category.id}`}
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            maxLength={255}
                            required
                            autoFocus
                            className={inputClassName}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-type-${category.id}`}
                            className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                          >
                            Type
                          </label>
                          <select
                            id={`edit-type-${category.id}`}
                            value={editingType}
                            onChange={(event) =>
                              setEditingType(event.target.value as CategoryType)
                            }
                            className={selectClassName}
                          >
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                          </select>
                        </div>
                      </div>
                      {editError && (
                        <p role="alert" className="text-sm text-[var(--color-danger)]">
                          {editError}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="min-h-11 bg-[var(--color-ink)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait disabled:opacity-60"
                        >
                          {isUpdating ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          className="min-h-11 border border-[var(--color-line)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center font-display text-2xl text-white ${accentClassName}`}
                          aria-hidden="true"
                        >
                          {category.cat_name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-[var(--color-ink)]">
                            {category.cat_name}
                          </p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                            {type.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {isDeleting ? (
                        <div className="border-l-2 border-[var(--color-danger)] bg-[#fff7f7] px-3 py-3 sm:max-w-xs">
                          <p className="text-xs leading-5 text-[#812020]">
                            Related movements will stay, but lose this category.
                          </p>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => void handleDelete(category.id)}
                              disabled={isDeletingThis}
                              className="min-h-10 bg-[var(--color-danger)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60"
                            >
                              {isDeletingThis ? "Deleting..." : "Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              disabled={isDeletingThis}
                              className="min-h-10 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:opacity-60"
                            >
                              Keep
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => beginEditing(category)}
                            className="min-h-11 border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingDeleteId(category.id);
                              setActionError("");
                            }}
                            className="min-h-11 border border-[#efbcbc] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-danger)] transition-colors hover:bg-[#fff1f1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  const hasCategories = categories.length > 0;

  return (
    <main className="min-h-screen bg-[var(--color-canvas)]">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]">
            <span className="flex h-9 w-9 items-center justify-center bg-[var(--color-primary)] font-mono text-base font-bold text-white">
              P
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">
              Pennywise
            </span>
          </Link>
          <Link
            href="/"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
          >
            Back to overview
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-6 border-b border-[var(--color-line)] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              Organize the numbers
            </p>
            <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--color-ink)] sm:text-7xl">
              Your categories.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              Shape the labels that keep your money organized. Create the
              structure that makes every movement easier to understand.
            </p>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)] sm:text-right">
            <span className="block text-3xl font-bold tracking-normal text-[var(--color-ink)]">
              {categories.length.toString().padStart(2, "0")}
            </span>
            categories total
          </div>
        </div>

        <div className="mb-12 grid gap-10 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.5fr)] lg:gap-16">
          <section aria-labelledby="create-category-heading">
            <div className="mb-5">
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                Add a new label
              </p>
              <h2
                id="create-category-heading"
                className="font-display text-3xl text-[var(--color-ink)]"
              >
                Create category
              </h2>
            </div>
            <form
              className="border border-[var(--color-line)] bg-[var(--color-surface)] p-5 sm:p-6"
              onSubmit={(event) => void handleCreate(event)}
            >
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="new-category-name"
                    className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                  >
                    Category name
                  </label>
                  <input
                    id="new-category-name"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    maxLength={255}
                    required
                    className={inputClassName}
                    placeholder="e.g. Groceries"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-category-type"
                    className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)]"
                  >
                    Type
                  </label>
                  <select
                    id="new-category-type"
                    value={newType}
                    onChange={(event) => setNewType(event.target.value as CategoryType)}
                    className={selectClassName}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                {createError && (
                  <p role="alert" className="text-sm text-[var(--color-danger)]">
                    {createError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={mutation?.type === "create"}
                  className="flex min-h-13 w-full items-center justify-between bg-[var(--color-ink)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] disabled:cursor-wait disabled:opacity-60"
                >
                  <span>
                    {mutation?.type === "create" ? "Creating..." : "Add category"}
                  </span>
                  <span aria-hidden="true" className="text-lg">
                    +
                  </span>
                </button>
              </div>
            </form>
          </section>

          <div aria-live="polite">
            {isLoading ? (
              <div className="space-y-8" aria-label="Loading categories">
                {["expense", "income"].map((group) => (
                  <div key={group}>
                    <div className="mb-4 h-12 animate-pulse border-b border-[var(--color-line)] bg-[#e9ebf0]" />
                    <div className="h-20 animate-pulse border border-[var(--color-line)] bg-[var(--color-surface)]" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-5 py-5" role="alert">
                <p className="font-semibold text-[#812020]">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void loadCategories()}
                  className="mt-4 min-h-11 border border-[#d98c8c] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#812020] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)]"
                >
                  Try again
                </button>
              </div>
            ) : !hasCategories ? (
              <div className="border border-dashed border-[var(--color-line)] px-6 py-14 text-center">
                <p className="font-display text-3xl text-[var(--color-ink)]">
                  No categories yet.
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                  Add a category to start giving your money movements a useful
                  shape.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {!isLoading && !loadError && hasCategories && (
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {renderCategoryGroup(
              "EXPENSE",
              "Expenses",
              "Money that moves out.",
              "bg-[var(--color-primary)]",
            )}
            {renderCategoryGroup(
              "INCOME",
              "Income",
              "Money that moves in.",
              "bg-[var(--color-secondary)]",
            )}
          </div>
        )}

        {actionError && (
          <p role="alert" className="mt-8 border-l-4 border-[var(--color-danger)] bg-[#fff1f1] px-4 py-3 text-sm text-[#812020]">
            {actionError}
          </p>
        )}
      </div>
    </main>
  );
}
