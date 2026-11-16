"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createAccount,
  fetchAccountsWorkspace,
  type AccountWithBalance,
  type AccountsWorkspace,
} from "@/features/accounts/api/accounts-api";

export function useAccounts() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [balance, setBalance] = useState<AccountsWorkspace["balance"] | null>(
    null,
  );
  const [currency, setCurrency] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const workspace = await fetchAccountsWorkspace();
      setAccounts(workspace.accounts);
      setBalance(workspace.balance);
      setCurrency(workspace.currentUser.currency);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Accounts could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialAccounts() {
      try {
        const workspace = await fetchAccountsWorkspace();

        if (!cancelled) {
          setAccounts(workspace.accounts);
          setBalance(workspace.balance);
          setCurrency(workspace.currentUser.currency);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Accounts could not be loaded.",
          );
          setIsLoading(false);
        }
      }
    }

    void loadInitialAccounts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<boolean> {
    event.preventDefault();

    if (isCreating) {
      return false;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      await createAccount({ name: newName });
      setNewName("");
      await loadAccounts();
      return true;
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Account could not be created.",
      );
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  return {
    accounts,
    balance,
    currency,
    isLoading,
    loadError,
    loadAccounts,
    newName,
    setNewName,
    createError,
    isCreating,
    handleCreate,
  };
}
