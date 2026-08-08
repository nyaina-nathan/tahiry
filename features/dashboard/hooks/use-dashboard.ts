"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Category } from "@/types/category.types";
import type { Balance } from "@/types/balance.types";
import type {
  MoneyMovement,
  MovementPage,
  MovementInput,
  MovementType,
} from "@/types/money-movement.types";
import {
  deleteMoneyMovement,
  fetchBalanceAndMovements,
  fetchDashboardData,
  saveMoneyMovement,
} from "@/features/dashboard/api/dashboard-api";
import { today } from "@/features/dashboard/utils/formatters";
import type {
  CurrentUser,
  Filters,
  Mutation,
} from "@/features/dashboard/types";

const INITIAL_FILTERS: Filters = {
  movementType: "ALL",
  categoryId: "",
  loggedForFrom: "",
  loggedForTo: "",
  page: 1,
};

export function useDashboard() {
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
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<MovementType>("EXPENSE");
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLoggedFor, setFormLoggedFor] = useState(today);
  const [formError, setFormError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function refreshMovementsAndBalance(activeFilters: Filters) {
    setIsListLoading(true);
    setActionError("");

    try {
      const data = await fetchBalanceAndMovements(activeFilters);
      setBalance(data.currentBalance);
      setMovements(data.currentMovements);
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
        const data = await fetchDashboardData(INITIAL_FILTERS);

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
      await deleteMoneyMovement(id);

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
