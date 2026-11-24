import {
  renderEmailButton,
  renderEmailCallout,
  renderEmailDocument,
  renderEmailText,
  renderEmailUrlFallback,
} from "./email-layout";

export function buildPasswordResetEmail(resetUrl: string): {
  html: string;
  text: string;
} {
  return {
    html: renderEmailDocument({
      preheader:
        "Use the secure link to choose a new password. It expires in 5 minutes.",
      heading: "Reset your password",
      content: [
        renderEmailText(
          "We received a request to reset the password for your Tahiry account. Choose a new password below.",
        ),
        renderEmailButton(resetUrl, "Reset password"),
        renderEmailCallout({
          tone: "info",
          title: "This link expires in 5 minutes",
          text: "For your security, request a new reset link if this one has expired.",
        }),
        renderEmailText(
          "If you did not request a password reset, you can safely ignore this email. Your password will stay the same.",
        ),
        renderEmailUrlFallback(resetUrl),
      ].join(""),
      footerNote:
        "You received this email because a password reset was requested for your Tahiry account.",
    }),
    text: [
      "Reset your password",
      "",
      "We received a request to reset the password for your Tahiry account. Choose a new password here:",
      resetUrl,
      "",
      "This link expires in 5 minutes. If it has expired, request a new reset link.",
      "",
      "If you did not request a password reset, you can safely ignore this email. Your password will stay the same.",
      "",
      "Tahiry - Every coin, in plain sight.",
    ].join("\n"),
  };
}
