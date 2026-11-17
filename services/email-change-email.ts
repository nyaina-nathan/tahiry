function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export function buildEmailChangeEmail(confirmationUrl: string): {
  html: string;
  text: string;
} {
  const escapedUrl = escapeHtml(confirmationUrl);

  return {
    html: [
      "<p>Confirm your new email address by clicking the link below:</p>",
      `<p><a href="${escapedUrl}">Confirm email change</a></p>`,
      "<p>If the button does not work, copy and paste this link into your browser:</p>",
      `<p>${escapedUrl}</p>`,
    ].join(""),
    text: [
      "Confirm your new email address by opening this link:",
      confirmationUrl,
    ].join("\n\n"),
  };
}

export function buildEmailChangedNotice(newEmail: string): {
  html: string;
  text: string;
} {
  const escapedEmail = escapeHtml(newEmail);

  return {
    html: [
      "<p>Your account email address was changed.</p>",
      `<p>The account now uses: <strong>${escapedEmail}</strong></p>`,
      "<p>If you did not make this change, please contact support.</p>",
    ].join(""),
    text: [
      "Your account email address was changed.",
      `The account now uses: ${newEmail}`,
      "If you did not make this change, please contact support.",
    ].join("\n\n"),
  };
}
