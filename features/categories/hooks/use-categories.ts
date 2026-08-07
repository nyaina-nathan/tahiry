"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Category, CategoryType } from "@/types/category.types";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  sortCategories,
  updateCategory,
} from "@/features/categories/api/categories-api";
import type { Mutation } from "@/features/categories/types";

export function useCategories() {
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
      const category = await createCategory({ cat_name: name, cat_type: newType });
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
      const updatedCategory = await updateCategory(id, {
        cat_name: name,
        cat_type: editingType,
      });
      setCategories((current) =>
        sortCategories([
          ...current.filter((category) => category.id !== id),
          updatedCategory,
        ]),
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
      await deleteCategory(id);
      setCategories((current) =>
        current.filter((category) => category.id !== id),
      );
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

  function requestDelete(id: string) {
    setPendingDeleteId(id);
    setActionError("");
  }

  return {
    categories,
    isLoading,
    loadError,
    actionError,
    mutation,
    newName,
    newType,
    createError,
    editingId,
    editingName,
    editingType,
    editError,
    pendingDeleteId,
    hasCategories: categories.length > 0,
    setNewName,
    setNewType,
    setEditingName,
    setEditingType,
    setPendingDeleteId,
    loadCategories,
    handleCreate,
    beginEditing,
    cancelEditing,
    handleUpdate,
    handleDelete,
    requestDelete,
  };
}
