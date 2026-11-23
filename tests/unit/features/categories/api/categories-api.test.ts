import { describe, expect, it, vi } from "vitest";
import {
  fetchCategories,
  sortCategories,
} from "@/features/categories/api/categories-api";
import type { Category } from "@/types/category.types";

function makeCategory(
  cat_name: string,
  id: string,
  cat_type: Category["cat_type"] = "EXPENSE",
): Category {
  return { id, id_user: "user-1", cat_type, cat_name };
}

describe("sortCategories", () => {
  it("sorts categories by name", () => {
    const sorted = sortCategories([
      makeCategory("Gamma", "1"),
      makeCategory("Alpha", "2"),
      makeCategory("Beta", "3"),
    ]);

    expect(sorted.map((category) => category.cat_name)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
    ]);
  });

  it("breaks name ties with the category id", () => {
    const sorted = sortCategories([
      makeCategory("Food", "b"),
      makeCategory("Food", "a"),
    ]);

    expect(sorted.map((category) => category.id)).toEqual(["a", "b"]);
  });

  it("does not mutate the input array", () => {
    const categories = [
      makeCategory("Zeta", "1"),
      makeCategory("Alpha", "2"),
    ];
    const original = [...categories];

    sortCategories(categories);

    expect(categories).toEqual(original);
  });
});

describe("fetchCategories", () => {
  it("loads and sorts categories", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json([
        makeCategory("Salary", "2", "INCOME"),
        makeCategory("Food", "1", "EXPENSE"),
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchCategories()).resolves.toEqual([
      makeCategory("Food", "1", "EXPENSE"),
      makeCategory("Salary", "2", "INCOME"),
    ]);
    expect(fetchMock).toHaveBeenCalledWith("/api/categories");
  });

  it("surfaces the API error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { error: { message: "Categories are unavailable." } },
          { status: 500 },
        ),
      ),
    );

    await expect(fetchCategories()).rejects.toThrow(
      "Categories are unavailable.",
    );
  });

  it("falls back when the error body is unusable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Bad gateway", { status: 502 })),
    );

    await expect(fetchCategories()).rejects.toThrow(
      "Categories could not be loaded.",
    );
  });
});
