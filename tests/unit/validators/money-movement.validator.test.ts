import { describe, expect, it } from "vitest";
import {
  parseMovementFilters,
  validateMovementInput,
  validateMovementPatch,
  validateMovementType,
  validateTransferInput,
  validateUuid,
} from "@/validators/money-movement.validator";
import { expectAppError } from "../helpers/expect-app-error";

const CATEGORY_ID = "123e4567-e89b-42d3-a456-426614174000";
const ACCOUNT_ID = "123e4567-e89b-42d3-a456-426614174001";
const OTHER_ACCOUNT_ID = "123e4567-e89b-42d3-a456-426614174002";

describe("validateUuid", () => {
  it("accepts canonical UUIDs in either case", () => {
    expect(validateUuid(CATEGORY_ID, "id_category")).toBe(CATEGORY_ID);
    expect(validateUuid(CATEGORY_ID.toUpperCase(), "id_category")).toBe(
      CATEGORY_ID.toUpperCase(),
    );
  });

  it("names the invalid field in the error message", () => {
    for (const value of ["not-a-uuid", "", 42, null, undefined]) {
      expectAppError(() => validateUuid(value, "id_account"), {
        message: "id_account must be a valid UUID.",
        status: 400,
        origin: "validation",
      });
    }
  });
});

describe("validateMovementType", () => {
  it("accepts the three supported movement types", () => {
    expect(validateMovementType("EXPENSE")).toBe("EXPENSE");
    expect(validateMovementType("INCOME")).toBe("INCOME");
    expect(validateMovementType("TRANSFERT")).toBe("TRANSFERT");
  });

  it("rejects any other value", () => {
    for (const value of ["expense", "TRANSFER", null, 1]) {
      expectAppError(() => validateMovementType(value), {
        message: "Movement type must be EXPENSE, INCOME or TRANSFERT.",
      });
    }
  });
});

describe("validateMovementInput", () => {
  it("validates and normalizes a complete payload", () => {
    expect(
      validateMovementInput({
        movement_type: "EXPENSE",
        id_category: CATEGORY_ID,
        id_account: ACCOUNT_ID,
        title: "  Groceries  ",
        description: "  Weekly shop  ",
        amount: "42.50",
        logged_for: "2026-11-17",
        logged_at: "2026-11-17T12:30:00Z",
      }),
    ).toEqual({
      movement_type: "EXPENSE",
      id_category: CATEGORY_ID,
      id_account: ACCOUNT_ID,
      title: "Groceries",
      description: "  Weekly shop  ",
      amount: "42.50",
      logged_for: "2026-11-17",
      logged_at: "2026-11-17T12:30:00Z",
    });
  });

  it("keeps optional fields omitted when they are not provided", () => {
    expect(
      validateMovementInput({ title: "Salary", amount: "100" }),
    ).toEqual({ title: "Salary", amount: "100" });
  });

  it("accepts explicit nulls for clearable fields", () => {
    expect(
      validateMovementInput({
        title: "Adjustment",
        amount: "-10.25",
        id_category: null,
        id_account: null,
        description: null,
        logged_for: null,
        logged_at: null,
      }),
    ).toEqual({
      title: "Adjustment",
      amount: "-10.25",
      id_category: null,
      id_account: null,
      description: null,
      logged_for: null,
      logged_at: null,
    });
  });

  it("rejects payloads that are not JSON objects", () => {
    for (const payload of [null, "text", 42, []]) {
      expectAppError(() => validateMovementInput(payload), {
        message: "Request body must be a JSON object.",
      });
    }
  });

  it("rejects transfer movements created through the movement endpoint", () => {
    expectAppError(
      () =>
        validateMovementInput({
          movement_type: "TRANSFERT",
          title: "Move",
          amount: "10.00",
        }),
      {
        message:
          "Movement type TRANSFERT can only be created through the transfer endpoint.",
      },
    );
  });

  it("requires a title between 1 and 255 characters", () => {
    for (const title of [undefined, "", "   ", 42, "a".repeat(256)]) {
      expectAppError(() => validateMovementInput({ title, amount: "10.00" }), {
        message: "Title must be between 1 and 255 characters.",
      });
    }
  });

  it("validates the amount string shape", () => {
    for (const amount of [
      undefined,
      10,
      "10.",
      ".5",
      "10.123",
      "123456789",
      "1,000.00",
      "1e3",
    ]) {
      expectAppError(
        () => validateMovementInput({ title: "Test", amount }),
        {
          message:
            "Amount must be a decimal string with up to 8 integer digits and 2 fractional digits.",
        },
      );
    }

    expect(validateMovementInput({ title: "Test", amount: "0.01" }).amount).toBe(
      "0.01",
    );
    expect(
      validateMovementInput({ title: "Test", amount: "99999999.99" }).amount,
    ).toBe("99999999.99");
  });

  it("rejects invalid calendar dates for logged_for", () => {
    for (const logged_for of ["2026-02-30", "2026-13-01", "17-11-2026"]) {
      expectAppError(
        () => validateMovementInput({ title: "Test", amount: "10.00", logged_for }),
        { message: "logged_for must use the YYYY-MM-DD format." },
      );
    }

    expectAppError(
      () =>
        validateMovementInput({
          title: "Test",
          amount: "10.00",
          logged_for: 20261117,
        }),
      { message: "logged_for must be a valid date." },
    );
  });

  it("requires a timezone for logged_at values", () => {
    for (const logged_at of ["2026-11-17", "2026-11-17T12:30:00"]) {
      expectAppError(
        () => validateMovementInput({ title: "Test", amount: "10.00", logged_at }),
        { message: "logged_at must use an RFC3339 date-time with a timezone." },
      );
    }
  });

  it("rejects non-RFC3339 logged_at values", () => {
    for (const logged_at of [
      "2026-11-17T24:00:00Z",
      "2026-11-17T12:60:00Z",
      "2026-11-17T12:30:60Z",
      "2026-11-17T12:30:00+24:00",
      "2026-02-30T12:30:00Z",
    ]) {
      expectAppError(
        () => validateMovementInput({ title: "Test", amount: "10.00", logged_at }),
        { message: "logged_at must be a valid RFC3339 date-time." },
      );
    }
  });

  it("accepts RFC3339 timestamps with Z or an offset", () => {
    expect(
      validateMovementInput({
        title: "Test",
        amount: "10.00",
        logged_at: "2026-11-17T12:30:00.123Z",
      }).logged_at,
    ).toBe("2026-11-17T12:30:00.123Z");
    expect(
      validateMovementInput({
        title: "Test",
        amount: "10.00",
        logged_at: "2026-11-17T12:30:00+03:00",
      }).logged_at,
    ).toBe("2026-11-17T12:30:00+03:00");
  });
});

describe("validateMovementPatch", () => {
  it("supports partial updates", () => {
    expect(validateMovementPatch({ title: "  Renamed  " })).toEqual({
      title: "Renamed",
    });
    expect(validateMovementPatch({ amount: "20.00" })).toEqual({
      amount: "20.00",
    });
    expect(validateMovementPatch({ movement_type: "INCOME" })).toEqual({
      movement_type: "INCOME",
    });
  });

  it("supports clearing nullable fields", () => {
    expect(
      validateMovementPatch({
        id_category: null,
        description: null,
        logged_for: null,
        logged_at: null,
      }),
    ).toEqual({
      id_category: null,
      description: null,
      logged_for: null,
      logged_at: null,
    });
  });

  it("requires at least one patchable field", () => {
    expectAppError(() => validateMovementPatch({}), {
      message: "At least one movement field must be provided.",
    });
    expectAppError(() => validateMovementPatch({ id_account: ACCOUNT_ID }), {
      message: "At least one movement field must be provided.",
    });
  });

  it("rejects transfer movement types", () => {
    expectAppError(() => validateMovementPatch({ movement_type: "TRANSFERT" }), {
      message:
        "Movement type TRANSFERT can only be created through the transfer endpoint.",
    });
  });

  it("validates patched values", () => {
    expectAppError(() => validateMovementPatch({ title: "  " }), {
      message: "Title must be between 1 and 255 characters.",
    });
    expectAppError(() => validateMovementPatch({ amount: "1.234" }), {
      message:
        "Amount must be a decimal string with up to 8 integer digits and 2 fractional digits.",
    });
    expectAppError(() => validateMovementPatch({ logged_for: "2026-02-30" }), {
      message: "logged_for must use the YYYY-MM-DD format.",
    });
    expectAppError(() => validateMovementPatch({ logged_at: "now" }), {
      message: "logged_at must use an RFC3339 date-time with a timezone.",
    });
  });
});

describe("validateTransferInput", () => {
  it("validates a minimal transfer", () => {
    expect(
      validateTransferInput({
        id_account_source: ACCOUNT_ID,
        id_account: OTHER_ACCOUNT_ID,
        amount: "25.00",
      }),
    ).toEqual({
      id_account_source: ACCOUNT_ID,
      id_account: OTHER_ACCOUNT_ID,
      amount: "25.00",
    });
  });

  it("accepts optional metadata", () => {
    expect(
      validateTransferInput({
        id_account_source: ACCOUNT_ID,
        id_account: OTHER_ACCOUNT_ID,
        amount: "25.50",
        title: "  Move to savings  ",
        description: "Monthly transfer",
        logged_for: "2026-11-17",
        logged_at: "2026-11-17T12:00:00Z",
      }),
    ).toEqual({
      id_account_source: ACCOUNT_ID,
      id_account: OTHER_ACCOUNT_ID,
      amount: "25.50",
      title: "Move to savings",
      description: "Monthly transfer",
      logged_for: "2026-11-17",
      logged_at: "2026-11-17T12:00:00Z",
    });
  });

  it("requires different source and destination accounts", () => {
    expectAppError(
      () =>
        validateTransferInput({
          id_account_source: ACCOUNT_ID,
          id_account: ACCOUNT_ID.toUpperCase(),
          amount: "25.00",
        }),
      { message: "Source and destination accounts must be different." },
    );
  });

  it("requires valid account identifiers", () => {
    expectAppError(
      () =>
        validateTransferInput({
          id_account_source: "source",
          id_account: OTHER_ACCOUNT_ID,
          amount: "25.00",
        }),
      { message: "id_account_source must be a valid UUID." },
    );
    expectAppError(
      () =>
        validateTransferInput({
          id_account_source: ACCOUNT_ID,
          id_account: "destination",
          amount: "25.00",
        }),
      { message: "id_account must be a valid UUID." },
    );
  });

  it("requires a positive amount", () => {
    for (const amount of ["-1.00", "abc", 25, undefined]) {
      expectAppError(
        () =>
          validateTransferInput({
            id_account_source: ACCOUNT_ID,
            id_account: OTHER_ACCOUNT_ID,
            amount,
          }),
        {
          message:
            "Amount must be a positive decimal string with up to 8 integer digits and 2 fractional digits.",
        },
      );
    }
  });

  it("rejects amounts that are zero", () => {
    for (const amount of ["0", "0.00"]) {
      expectAppError(
        () =>
          validateTransferInput({
            id_account_source: ACCOUNT_ID,
            id_account: OTHER_ACCOUNT_ID,
            amount,
          }),
        { message: "Amount must be greater than 0." },
      );
    }
  });

  it("rejects payloads that are not JSON objects", () => {
    expectAppError(() => validateTransferInput(null), {
      message: "Request body must be a JSON object.",
    });
  });
});

describe("parseMovementFilters", () => {
  it("applies pagination defaults", () => {
    expect(parseMovementFilters(new URLSearchParams())).toEqual({
      page: 1,
      pageSize: 25,
    });
  });

  it("parses every supported filter", () => {
    const params = new URLSearchParams({
      movement_type: "EXPENSE",
      id_category: CATEGORY_ID,
      id_account: ACCOUNT_ID,
      logged_for_from: "2026-01-01",
      logged_for_to: "2026-12-31",
      page: "3",
      page_size: "100",
    });

    expect(parseMovementFilters(params)).toEqual({
      movementType: "EXPENSE",
      categoryId: CATEGORY_ID,
      accountId: ACCOUNT_ID,
      loggedForFrom: "2026-01-01",
      loggedForTo: "2026-12-31",
      page: 3,
      pageSize: 100,
    });
  });

  it("rejects a reversed date range", () => {
    const params = new URLSearchParams({
      logged_for_from: "2026-12-31",
      logged_for_to: "2026-01-01",
    });

    expectAppError(() => parseMovementFilters(params), {
      message: "logged_for_from cannot be after logged_for_to.",
    });
  });

  it("rejects invalid filters", () => {
    expectAppError(
      () => parseMovementFilters(new URLSearchParams({ movement_type: "ALL" })),
      { message: "Movement type must be EXPENSE, INCOME or TRANSFERT." },
    );
    expectAppError(
      () => parseMovementFilters(new URLSearchParams({ id_category: "nope" })),
      { message: "id_category must be a valid UUID." },
    );
    expectAppError(
      () => parseMovementFilters(new URLSearchParams({ logged_for_from: "nope" })),
      { message: "logged_for must use the YYYY-MM-DD format." },
    );
  });

  it("rejects non-integer page values", () => {
    for (const page of ["-1", "1.5", "ten"]) {
      expectAppError(
        () => parseMovementFilters(new URLSearchParams({ page })),
        { message: "page must be a positive integer." },
      );
    }

    for (const page_size of ["-1", "1.5", "ten"]) {
      expectAppError(
        () => parseMovementFilters(new URLSearchParams({ page_size })),
        { message: "page_size must be a positive integer." },
      );
    }
  });

  it("rejects zero and out-of-range page values", () => {
    expectAppError(
      () => parseMovementFilters(new URLSearchParams({ page: "0" })),
      { message: "page must be at least 1." },
    );
    expectAppError(
      () => parseMovementFilters(new URLSearchParams({ page_size: "0" })),
      { message: "page_size must be between 1 and 100." },
    );
    expect(
      parseMovementFilters(new URLSearchParams({ page_size: "100" })).pageSize,
    ).toBe(100);
    expectAppError(
      () => parseMovementFilters(new URLSearchParams({ page_size: "101" })),
      { message: "page_size must be between 1 and 100." },
    );
  });
});
