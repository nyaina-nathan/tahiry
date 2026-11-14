"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Category } from "@/types/category.types";
import type { Balance } from "@/types/balance.types";
import type {
  MoneyMovement,
  MovementInput,
  MovementPage,
  MovementType,
} from "@/types/money-movement.types";
import {
  deleteMoneyMovement,
  fetchWorkspaceData,
  fetchWorkspaceUpdates,
  saveMoneyMovement,
} from "@/features/dashboard/api/dashboard-api";
import { today } from "@/features/dashboard/utils/formatters";
import type {
  CurrentUser,
  Filters,
  Mutation,
} from "@/features/dashboard/types";

type UseMoneyMovementsOptions = {
  fixedType?: MovementType;
  withBalance?: boolean;
  initialPageSize?: number;
};

function createInitialFilters(
  fixedType?: MovementType,
  pageSize = 25,
): Filters {
  return {
    movementType: fixedType ?? "ALL",
    categoryId: "",
    loggedForFrom: "",
    loggedForTo: "",
    page: 1,
    pageSize,
  };
}

export function useMoneyMovements({
  fixedType,
  withBalance = true,
  initialPageSize = 25,
}: UseMoneyMovementsOptions = {}) {
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
  const [filters, setFilters] = useState<Filters>(() =>
    createInitialFilters(fixedType, initialPageSize),
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [formType, setFormType] = useState<MovementType>(
    fixedType ?? "EXPENSE",
  );
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLoggedFor, setFormLoggedFor] = useState(today);
  const [formError, setFormError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function refreshWorkspace(activeFilters: Filters) {
    setIsListLoading(true);
    setActionError("");

    try {
      const data = await fetchWorkspaceUpdates(activeFilters, withBalance);

      if (data.currentBalance !== null) {
        setBalance(data.currentBalance);
      }
      setMovements(data.currentMovements);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "The movements could not be refreshed.",
      );
    } finally {
      setIsListLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      setIsLoading(true);
      setLoadError("");
      setFilters(createInitialFilters(fixedType, initialPageSize));

      try {
        const data = await fetchWorkspaceData(
          createInitialFilters(fixedType, initialPageSize),
          withBalance,
        );

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
              : "The movements could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [fixedType, withBalance, initialPageSize]);

  function updateFilters(nextFilters: Filters) {
    const normalizedFilters = fixedType
      ? { ...nextFilters, movementType: fixedType }
      : nextFilters;

    setFilters(normalizedFilters);
    void refreshWorkspace(normalizedFilters);
  }

  function resetForm() {
    setEditingId(null);
    setIsCreateFormOpen(false);
    setFormType(fixedType ?? "EXPENSE");
    setFormTitle("");
    setFormAmount("");
    setFormCategoryId("");
    setFormDescription("");
    setFormLoggedFor(today());
    setFormError("");
  }

  function beginCreating() {
    setActionError("");
    setPendingDeleteId(null);
    resetForm();
    setIsCreateFormOpen(true);
  }

  function beginEditing(movement: MoneyMovement) {
    setActionError("");
    setFormError("");
    setPendingDeleteId(null);
    setIsCreateFormOpen(false);
    setEditingId(movement.id);
    setFormType(fixedType ?? movement.movement_type);
    setFormTitle(movement.title);
    setFormAmount(movement.amount);
    setFormCategoryId(movement.id_category ?? "");
    setFormDescription(movement.description ?? "");
    setFormLoggedFor(movement.logged_for ?? today());
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

    const payload: MovementInput = {
      movement_type: formType,
      title: formTitle.trim(),
      amount: formAmount.trim(),
      id_category: formCategoryId || null,
      description: formDescription.trim() || null,
      logged_for: formLoggedFor || null,
    };

    try {
      await saveMoneyMovement(editingId, payload);
      resetForm();
      await refreshWorkspace(filters);
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
      await deleteMoneyMovement(id);

      if (editingId === id) {
        resetForm();
      }
      setPendingDeleteId(null);
      await refreshWorkspace(filters);
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

  function requestDelete(id: string) {
    setPendingDeleteId(id);
    setActionError("");
  }

  const totalPages = movements
    ? Math.max(1, Math.ceil(movements.total / movements.page_size))
    : 1;

  return {
    user,
    balance,
    categories,
    movements,
    isLoading,
    isListLoading,
    loadError,
    actionError,
    mutation,
    filters,
    editingId,
    isCreateFormOpen,
    formType,
    formTitle,
    formAmount,
    formCategoryId,
    formDescription,
    formLoggedFor,
    formError,
    pendingDeleteId,
    totalPages,
    updateFilters,
    resetForm,
    beginCreating,
    beginEditing,
    handleSubmit,
    handleDelete,
    requestDelete,
    setFormType,
    setFormTitle,
    setFormAmount,
    setFormCategoryId,
    setFormDescription,
    setFormLoggedFor,
    setPendingDeleteId,
  };
}
