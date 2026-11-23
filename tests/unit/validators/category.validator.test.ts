import { describe, expect, it } from "vitest";
import {
  parseCategoryTypeQuery,
  validateCategoryInput,
  validateCategoryPatch,
  validateCategoryType,
} from "@/validators/category.validator";
import { expectAppError } from "../helpers/expect-app-error";

describe("validateCategoryType", () => {
  it("accepts the two supported category types", () => {
    expect(validateCategoryType("EXPENSE")).toBe("EXPENSE");
    expect(validateCategoryType("INCOME")).toBe("INCOME");
  });

  it("rejects any other value", () => {
    for (const value of ["TRANSFERT", "expense", null, undefined, 1]) {
      expectAppError(() => validateCategoryType(value), {
        message: "Category type must be EXPENSE or INCOME.",
        status: 400,
        origin: "validation",
      });
    }
  });
});

describe("parseCategoryTypeQuery", () => {
  it("returns undefined when the query parameter is absent", () => {
    expect(parseCategoryTypeQuery(null)).toBeUndefined();
  });

  it("validates a present query parameter", () => {
    expect(parseCategoryTypeQuery("INCOME")).toBe("INCOME");
    expectAppError(() => parseCategoryTypeQuery("ALL"), {
      message: "Category type must be EXPENSE or INCOME.",
    });
  });
});

describe("validateCategoryInput", () => {
  it("trims the name and keeps an optional type", () => {
    expect(
      validateCategoryInput({ cat_name: "  Food  ", cat_type: "EXPENSE" }),
    ).toEqual({ cat_name: "Food", cat_type: "EXPENSE" });
    expect(validateCategoryInput({ cat_name: "  Salary  " })).toEqual({
      cat_name: "Salary",
    });
  });

  it("rejects payloads that are not JSON objects", () => {
    expectAppError(() => validateCategoryInput([]), {
      message: "Request body must be a JSON object.",
    });
  });

  it("requires a name between 1 and 255 characters", () => {
    for (const cat_name of [undefined, "", "   ", 7, "a".repeat(256)]) {
      expectAppError(() => validateCategoryInput({ cat_name }), {
        message: "Category name must be between 1 and 255 characters.",
      });
    }
  });

  it("rejects an unsupported type", () => {
    expectAppError(
      () => validateCategoryInput({ cat_name: "Food", cat_type: "OTHER" }),
      { message: "Category type must be EXPENSE or INCOME." },
    );
  });
});

describe("validateCategoryPatch", () => {
  it("accepts a name-only patch", () => {
    expect(validateCategoryPatch({ cat_name: "  Groceries  " })).toEqual({
      cat_name: "Groceries",
    });
  });

  it("accepts a type-only patch", () => {
    expect(validateCategoryPatch({ cat_type: "INCOME" })).toEqual({
      cat_type: "INCOME",
    });
  });

  it("accepts a combined patch", () => {
    expect(
      validateCategoryPatch({ cat_name: "Bonus", cat_type: "INCOME" }),
    ).toEqual({ cat_name: "Bonus", cat_type: "INCOME" });
  });

  it("rejects payloads without any category field", () => {
    expectAppError(() => validateCategoryPatch({}), {
      message: "At least one category field must be provided.",
    });
  });

  it("rejects an invalid patched name or type", () => {
    expectAppError(() => validateCategoryPatch({ cat_name: "   " }), {
      message: "Category name must be between 1 and 255 characters.",
    });
    expectAppError(() => validateCategoryPatch({ cat_type: "OTHER" }), {
      message: "Category type must be EXPENSE or INCOME.",
    });
  });
});
