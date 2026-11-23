import { describe, expect, it } from "vitest";
import {
  getEmailChangeResult,
  removeEmailChangeResultFromUrl,
} from "@/features/settings/utils/email-change-feedback";

describe("getEmailChangeResult", () => {
  it("reads true and false results from the query string", () => {
    expect(getEmailChangeResult("?emailChangeSuccess=true")).toBe(true);
    expect(getEmailChangeResult("?emailChangeSuccess=false")).toBe(false);
  });

  it("ignores missing or invalid result values", () => {
    expect(getEmailChangeResult("")).toBeNull();
    expect(getEmailChangeResult("?emailChangeSuccess=yes")).toBeNull();
    expect(getEmailChangeResult("?emailChangeSuccess=TRUE")).toBeNull();
    expect(getEmailChangeResult("?emailChangeSuccess=")).toBeNull();
  });
});

describe("removeEmailChangeResultFromUrl", () => {
  it("removes only the result while keeping other URL state", () => {
    expect(
      removeEmailChangeResultFromUrl(
        "https://example.com/settings?tab=profile&emailChangeSuccess=true#email",
      ),
    ).toBe("/settings?tab=profile#email");
  });

  it("keeps the hash when the result was the only parameter", () => {
    expect(
      removeEmailChangeResultFromUrl(
        "https://example.com/settings?emailChangeSuccess=false#email",
      ),
    ).toBe("/settings#email");
  });

  it("leaves URLs without the result unchanged", () => {
    expect(
      removeEmailChangeResultFromUrl("https://example.com/settings?tab=profile"),
    ).toBe("/settings?tab=profile");
  });
});
