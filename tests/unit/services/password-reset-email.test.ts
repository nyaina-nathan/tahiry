import { describe, expect, it } from "vitest";
import { buildPasswordResetEmail } from "@/services/password-reset-email";

describe("buildPasswordResetEmail", () => {
  it("includes the reset link in HTML and plain text", () => {
    const resetUrl =
      "https://app.example.com/api/auth/password-reset/confirm?token=abc123";
    const email = buildPasswordResetEmail(resetUrl);

    expect(email.html).toContain(`href="${resetUrl}"`);
    expect(email.html).toContain(">Reset password</a>");
    expect(email.html).toContain(resetUrl);
    expect(email.text).toContain(resetUrl);
  });

  it("mentions the five-minute expiry in both formats", () => {
    const email = buildPasswordResetEmail("https://app.example.com/reset");

    expect(email.html).toContain("expires in 5 minutes");
    expect(email.text).toContain("expires in 5 minutes");
  });

  it("escapes HTML characters in the HTML body but not in the text body", () => {
    const resetUrl = 'https://app.example.com/reset?a=1&b="2"';
    const email = buildPasswordResetEmail(resetUrl);

    expect(email.html).toContain(
      "https://app.example.com/reset?a=1&amp;b=&quot;2&quot;",
    );
    expect(email.text).toContain(resetUrl);
  });
});
