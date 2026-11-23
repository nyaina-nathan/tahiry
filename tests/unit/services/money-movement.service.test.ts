import { describe, expect, it, vi } from "vitest";
import type { StoredMovement } from "@/services/money-movement.service";

vi.mock("@/libs/db/prisma", () => ({ prisma: {} }));

const { toMoneyMovement } = await import("@/services/money-movement.service");

function decimal(value: string) {
  return {
    toFixed: (digits: number) => Number(value).toFixed(digits),
  } as unknown as StoredMovement["amount"];
}

function makeStoredMovement(
  overrides: Partial<StoredMovement> = {},
): StoredMovement {
  return {
    id: "movement-id",
    id_user: "123e4567-e89b-42d3-a456-426614174000",
    id_category: "123e4567-e89b-42d3-a456-426614174001",
    movement_type: "EXPENSE",
    id_account: "123e4567-e89b-42d3-a456-426614174002",
    id_account_source: null,
    title: "Groceries",
    description: "Weekly shop",
    amount: decimal("42.5"),
    logged_for: new Date("2026-11-17T00:00:00.000Z"),
    logged_at: new Date("2026-11-17T12:30:00.000Z"),
    ...overrides,
  };
}

describe("toMoneyMovement", () => {
  it("maps a stored movement to the API shape", () => {
    expect(toMoneyMovement(makeStoredMovement())).toEqual({
      id: "movement-id",
      id_user: "123e4567-e89b-42d3-a456-426614174000",
      id_category: "123e4567-e89b-42d3-a456-426614174001",
      movement_type: "EXPENSE",
      id_account: "123e4567-e89b-42d3-a456-426614174002",
      id_account_source: null,
      title: "Groceries",
      description: "Weekly shop",
      amount: "42.50",
      logged_for: "2026-11-17",
      logged_at: "2026-11-17T12:30:00.000Z",
    });
  });

  it("formats the amount to two decimal places", () => {
    expect(
      toMoneyMovement(makeStoredMovement({ amount: decimal("100") })).amount,
    ).toBe("100.00");
    expect(
      toMoneyMovement(makeStoredMovement({ amount: decimal("0.005") })).amount,
    ).toBe("0.01");
  });

  it("keeps nullable fields as null", () => {
    const movement = toMoneyMovement(
      makeStoredMovement({
        id_category: null,
        description: null,
        id_account: null,
        id_account_source: null,
        logged_for: null,
        logged_at: null,
      }),
    );

    expect(movement.id_category).toBeNull();
    expect(movement.description).toBeNull();
    expect(movement.id_account).toBeNull();
    expect(movement.id_account_source).toBeNull();
    expect(movement.logged_for).toBeNull();
    expect(movement.logged_at).toBeNull();
  });

  it("preserves the transfer account pair", () => {
    const movement = toMoneyMovement(
      makeStoredMovement({
        movement_type: "TRANSFERT",
        id_account: "destination-account",
        id_account_source: "source-account",
      }),
    );

    expect(movement.movement_type).toBe("TRANSFERT");
    expect(movement.id_account).toBe("destination-account");
    expect(movement.id_account_source).toBe("source-account");
  });
});
