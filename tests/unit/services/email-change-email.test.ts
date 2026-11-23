import { describe, expect, it } from "vitest";
import {
  buildEmailChangeEmail,
  buildEmailChangedNotice,
} from "@/services/email-change-email";

describe("buildEmailChangeEmail", () => {
  it("includes a short HTML confirmation link and the full URL fallback", () => {
    const confirmationUrl =
      "https://app.example.com/api/auth/email-change/confirm?token=abc123";
    const email = buildEmailChangeEmail(confirmationUrl);

    expect(email.html).toContain(
      `<a href="${confirmationUrl}">Confirm email change</a>`,
    );
    expect(email.html).toContain(confirmationUrl);
    expect(email.text).toContain(confirmationUrl);
  });

  it("escapes HTML characters in the HTML body but not in the text body", () => {
    const confirmationUrl = 'https://app.example.com/confirm?a=1&b="2"';
    const email = buildEmailChangeEmail(confirmationUrl);

    expect(email.html).toContain(
      "https://app.example.com/confirm?a=1&amp;b=&quot;2&quot;",
    );
    expect(email.text).toContain(confirmationUrl);
  });
});

describe("buildEmailChangedNotice", () => {
  it("tells the previous account which new email address is now in use", () => {
    const email = buildEmailChangedNotice("new@example.com");

    expect(email.html).toContain("Your account email address was changed.");
    expect(email.html).toContain("new@example.com");
    expect(email.text).toContain("new@example.com");
  });

  it("escapes the new address in HTML but shows it verbatim in text", () => {
    const email = buildEmailChangedNotice("<new@example.com>");

    expect(email.html).toContain("&lt;new@example.com&gt;");
    expect(email.text).toContain("<new@example.com>");
  });
});
