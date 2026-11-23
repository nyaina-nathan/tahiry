import { describe, expect, it } from "vitest";
import { buildMovementQuery } from "@/features/dashboard/api/dashboard-api";
import type { Filters } from "@/features/dashboard/types";

function makeFilters(overrides: Partial<Filters> = {}): Filters {
  return {
    movementType: "ALL",
    categoryId: "",
    loggedForFrom: "",
    loggedForTo: "",
    page: 1,
    pageSize: 25,
    ...overrides,
  };
}

describe("buildMovementQuery", () => {
  it("always includes pagination", () => {
    expect(buildMovementQuery(makeFilters())).toBe("page=1&page_size=25");
  });

  it("omits the ALL movement type and empty filters", () => {
    const query = new URLSearchParams(
      buildMovementQuery(
        makeFilters({
          categoryId: "",
          accountId: "",
          loggedForFrom: "",
          loggedForTo: "",
        }),
      ),
    );

    expect(query.has("movement_type")).toBe(false);
    expect(query.has("id_category")).toBe(false);
    expect(query.has("id_account")).toBe(false);
    expect(query.has("logged_for_from")).toBe(false);
    expect(query.has("logged_for_to")).toBe(false);
  });

  it("includes every active filter", () => {
    const query = new URLSearchParams(
      buildMovementQuery(
        makeFilters({
          movementType: "EXPENSE",
          categoryId: "category-id",
          accountId: "account-id",
          loggedForFrom: "2026-01-01",
          loggedForTo: "2026-12-31",
          page: 3,
          pageSize: 100,
        }),
      ),
    );

    expect(query.get("movement_type")).toBe("EXPENSE");
    expect(query.get("id_category")).toBe("category-id");
    expect(query.get("id_account")).toBe("account-id");
    expect(query.get("logged_for_from")).toBe("2026-01-01");
    expect(query.get("logged_for_to")).toBe("2026-12-31");
    expect(query.get("page")).toBe("3");
    expect(query.get("page_size")).toBe("100");
  });

  it("includes a movement type other than ALL", () => {
    expect(
      new URLSearchParams(
        buildMovementQuery(makeFilters({ movementType: "INCOME" })),
      ).get("movement_type"),
    ).toBe("INCOME");
  });
});
