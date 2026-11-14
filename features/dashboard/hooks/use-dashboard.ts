"use client";

import { useMoneyMovements } from "@/features/movements/hooks/use-money-movements";

export function useDashboard() {
  return useMoneyMovements();
}
