"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CurrentUser } from "@/types/user.types";
import {
  fetchCurrentUser,
  updateCurrentUser,
} from "@/features/settings/api/user-settings-api";

export function useUserSettings() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [username, setUsername] = useState("");
  const [currency, setCurrency] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const loadedUser = await fetchCurrentUser();
      setUser(loadedUser);
      setUsername(loadedUser.username);
      setCurrency(loadedUser.currency);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Your profile could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading the external profile state is the purpose of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUser();
  }, [loadUser]);

  function beginEditing() {
    if (!user) {
      return;
    }

    setUsername(user.username);
    setCurrency(user.currency);
    setError("");
    setSuccess("");
    setIsEditing(true);
  }

  function cancelEditing() {
    if (user) {
      setUsername(user.username);
      setCurrency(user.currency);
    }

    setError("");
    setIsEditing(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<boolean> {
    event.preventDefault();

    if (isSaving || !user) {
      return false;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await updateCurrentUser({
        username,
        currency,
      });

      setUser(updatedUser);
      setUsername(updatedUser.username);
      setCurrency(updatedUser.currency);
      setIsEditing(false);
      setSuccess("Your profile has been saved.");
      window.dispatchEvent(new Event("profilechange"));
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Your profile could not be updated.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    user,
    username,
    setUsername,
    currency,
    setCurrency,
    isEditing,
    isLoading,
    isSaving,
    error,
    success,
    beginEditing,
    cancelEditing,
    handleSubmit,
    loadUser,
  };
}
