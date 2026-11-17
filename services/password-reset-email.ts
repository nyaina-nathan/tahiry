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

export function buildPasswordResetEmail(resetUrl: string): {
  html: string;
  text: string;
} {
  const escapedUrl = escapeHtml(resetUrl);

  return {
    html: [
      "<p>You requested a password reset. Use the link below to choose a new password:</p>",
      `<p><a href="${escapedUrl}">Reset password</a></p>`,
      "<p>This link expires in 5 minutes. If you did not request a password reset, you can ignore this email.</p>",
      "<p>If the button does not work, copy and paste this link into your browser:</p>",
      `<p>${escapedUrl}</p>`,
    ].join(""),
    text: [
      "You requested a password reset. Open this link to choose a new password:",
      resetUrl,
      "This link expires in 5 minutes. If you did not request a password reset, you can ignore this email.",
    ].join("\n\n"),
  };
}
