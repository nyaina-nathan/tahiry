import {
  renderEmailButton,
  renderEmailCallout,
  renderEmailDocument,
  renderEmailHighlight,
  renderEmailText,
  renderEmailUrlFallback,
} from "./email-layout";

export function buildEmailChangeEmail(confirmationUrl: string): {
  html: string;
  text: string;
} {
  return {
    html: renderEmailDocument({
      preheader:
        "Confirm the new email address for your Tahiry account. This link expires in 10 minutes.",
      heading: "Confirm your new email",
      content: [
        renderEmailText(
          "You asked to change the email address on your Tahiry account. Confirm the new address below to finish the change.",
        ),
        renderEmailButton(confirmationUrl, "Confirm email change"),
        renderEmailCallout({
          tone: "info",
          title: "This link expires in 10 minutes",
          text: "If it has expired, start the email change again from your settings.",
        }),
        renderEmailText(
          "If you did not request this change, ignore this email. Your current address will stay the same.",
        ),
        renderEmailUrlFallback(confirmationUrl),
      ].join(""),
      footerNote:
        "You received this email because an email change was requested for your Tahiry account.",
    }),
    text: [
      "Confirm your new email",
      "",
      "You asked to change the email address on your Tahiry account. Confirm the new address here:",
      confirmationUrl,
      "",
      "This link expires in 10 minutes. If it has expired, start the email change again from your settings.",
      "",
      "If you did not request this change, ignore this email. Your current address will stay the same.",
      "",
      "Tahiry - Every coin, in plain sight.",
    ].join("\n"),
  };
}

export function buildEmailChangedNotice(newEmail: string): {
  html: string;
  text: string;
} {
  return {
    html: renderEmailDocument({
      preheader:
        "The email address on your Tahiry account has been updated.",
      heading: "Your account email was changed",
      content: [
        renderEmailText(
          "Your account email address was changed. The account now uses the address below:",
        ),
        renderEmailHighlight(newEmail),
        renderEmailCallout({
          tone: "warning",
          title: "Did not make this change?",
          text: "Contact support right away so we can help secure your account.",
        }),
      ].join(""),
      footerNote:
        "You received this email because the email address on a Tahiry account was changed.",
    }),
    text: [
      "Your account email was changed",
      "",
      "Your account email address was changed. The account now uses:",
      newEmail,
      "",
      "If you did not make this change, contact support right away so we can help secure your account.",
      "",
      "Tahiry - Every coin, in plain sight.",
    ].join("\n"),
  };
}
