"use client";

import { useCallback, useEffect, useState } from "react";
import {
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

  return {
    accounts,
    balance,
    currency,
    isLoading,
    loadError,
    loadAccounts,
  };
}
