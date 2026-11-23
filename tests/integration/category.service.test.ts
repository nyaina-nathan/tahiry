import { beforeEach, describe, expect, it } from "vitest";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "@/services/category.service";
import { prisma, resetDatabase } from "./helpers/database";
import { expectAppErrorAsync } from "./helpers/errors";
import {
  createCategory as createCategoryFixture,
  createMovement,
  createUser,
} from "./helpers/fixtures";

beforeEach(resetDatabase);

describe("createCategory", () => {
  it("creates an expense category by default", async () => {
    const user = await createUser();

    const category = await createCategory(user.id, { cat_name: "Food" });

    expect(category).toMatchObject({
      id_user: user.id,
      cat_name: "Food",
      cat_type: "EXPENSE",
    });
  });

  it("creates an income category when requested", async () => {
    const user = await createUser();

    await expect(
      createCategory(user.id, { cat_name: "Salary", cat_type: "INCOME" }),
    ).resolves.toMatchObject({ cat_name: "Salary", cat_type: "INCOME" });
  });

  it("rejects invalid user ids", async () => {
    await expectAppErrorAsync(
      createCategory(null, { cat_name: "Food" }),
      { status: 401 },
    );
  });
});

describe("listCategories", () => {
  it("sorts categories by name", async () => {
    const user = await createUser();
    await createCategoryFixture(user.id, "Travel");
    await createCategoryFixture(user.id, "Food");

    const categories = await listCategories(user.id);

    expect(categories.map((category) => category.cat_name)).toEqual([
      "Food",
      "Travel",
    ]);
  });

  it("filters by category type", async () => {
    const user = await createUser();
    await createCategoryFixture(user.id, "Food", "EXPENSE");
    await createCategoryFixture(user.id, "Salary", "INCOME");

    const categories = await listCategories(user.id, "INCOME");

    expect(categories.map((category) => category.cat_name)).toEqual(["Salary"]);
  });

  it("does not list another user's categories", async () => {
    const user = await createUser();
    const other = await createUser();
    await createCategoryFixture(other.id, "Private");

    await expect(listCategories(user.id)).resolves.toEqual([]);
  });
});

describe("getCategory", () => {
  it("returns an owned category", async () => {
    const user = await createUser();
    const category = await createCategoryFixture(user.id, "Food");

    await expect(getCategory(user.id, category.id)).resolves.toMatchObject({
      id: category.id,
      cat_name: "Food",
    });
  });

  it("does not expose another user's category", async () => {
    const user = await createUser();
    const other = await createUser();
    const category = await createCategoryFixture(other.id, "Private");

    await expectAppErrorAsync(getCategory(user.id, category.id), {
      title: "Not Found",
      message: "Category not found.",
      status: 404,
      origin: "category",
    });
  });
});

describe("updateCategory", () => {
  it("updates the name and type", async () => {
    const user = await createUser();
    const category = await createCategoryFixture(user.id, "Food", "EXPENSE");

    await expect(
      updateCategory(user.id, category.id, {
        cat_name: "Salary",
        cat_type: "INCOME",
      }),
    ).resolves.toMatchObject({ cat_name: "Salary", cat_type: "INCOME" });
  });

  it("does not update another user's category", async () => {
    const user = await createUser();
    const other = await createUser();
    const category = await createCategoryFixture(other.id, "Private");

    await expectAppErrorAsync(
      updateCategory(user.id, category.id, { cat_name: "Stolen" }),
      { status: 404 },
    );
  });
});

describe("deleteCategory", () => {
  it("deletes a category and uncategorises its movements", async () => {
    const user = await createUser();
    const category = await createCategoryFixture(user.id, "Food");
    const movement = await createMovement(user.id, {
      id_category: category.id,
    });

    await deleteCategory(user.id, category.id);

    await expect(
      prisma.categories.findUnique({ where: { id: category.id } }),
    ).resolves.toBeNull();
    await expect(
      prisma.money_movements.findUnique({ where: { id: movement.id } }),
    ).resolves.toMatchObject({ id_category: null });
  });

  it("does not delete another user's category", async () => {
    const user = await createUser();
    const other = await createUser();
    const category = await createCategoryFixture(other.id, "Private");

    await expectAppErrorAsync(deleteCategory(user.id, category.id), {
      status: 404,
    });
  });

  it("rejects deleting a missing category", async () => {
    const user = await createUser();

    await expectAppErrorAsync(
      deleteCategory(user.id, "123e4567-e89b-42d3-a456-426614174000"),
      { status: 404 },
    );
  });
});
