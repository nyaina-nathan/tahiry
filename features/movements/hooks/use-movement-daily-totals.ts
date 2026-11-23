"use client";

import { useCallback, useEffect, useState } from "react";
import type { MovementType } from "@/types/money-movement.types";
import { fetchMovementDailyTotals } from "@/features/dashboard/api/dashboard-api";
import type {
  DailyTotalPoint,
  DateRange,
} from "@/features/dashboard/utils/date-range";

type UseMovementDailyTotalsOptions = {
  range: DateRange | null;
  movementType: Exclude<MovementType, "TRANSFERT">;
  categoryId?: string;
  accountId?: string;
  revision?: number;
};

export function useMovementDailyTotals({
  range,
  movementType,
  categoryId,
  accountId,
  revision = 0,
}: UseMovementDailyTotalsOptions) {
  const [points, setPoints] = useState<DailyTotalPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const from = range?.from ?? null;
  const to = range?.to ?? null;
  const hasRange = from !== null && to !== null;

  useEffect(() => {
    if (!from || !to) {
      return;
    }

    let cancelled = false;

    async function loadDailyTotals(activeFrom: string, activeTo: string) {
      setIsLoading(true);
      setError("");

      try {
        const data = await fetchMovementDailyTotals({
          from: activeFrom,
          to: activeTo,
          movementType,
          categoryId,
          accountId,
        });

        if (!cancelled) {
          setPoints(data);
        }
      } catch (cause) {
        if (!cancelled) {
          setPoints([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "The chart could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDailyTotals(from, to);

    return () => {
      cancelled = true;
    };
  }, [
    from,
    to,
    movementType,
    categoryId,
    accountId,
    revision,
    retryToken,
  ]);

  const refresh = useCallback(() => {
    setRetryToken((current) => current + 1);
  }, []);

  return {
    points: hasRange ? points : [],
    isLoading: hasRange ? isLoading : false,
    error: hasRange ? error : "Choose a valid date range.",
    refresh,
  };
}
