const FONT_FAMILY =
  "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO_FONT_FAMILY =
  "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

export const EMAIL_COLORS = {
  canvas: "#eef1f4",
  surface: "#ffffff",
  ink: "#111827",
  body: "#475467",
  muted: "#667085",
  line: "#e2e6ee",
  subtleSurface: "#f8fafc",
  accent: "#064e3b",
  accentInverse: "#34d399",
  accentSoft: "#ecfdf5",
  accentSoftLine: "#a7f3d0",
  negative: "#b91c1c",
  negativeSoft: "#fef2f2",
  negativeLine: "#fecaca",
} as const;

export function escapeHtml(value: string): string {
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

function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_FAMILY};font-size:15px;line-height:1.65;color:${EMAIL_COLORS.body};">${html}</p>`;
}

export function renderEmailText(text: string): string {
  return paragraph(escapeHtml(text));
}

export function renderEmailHtml(html: string): string {
  return paragraph(html);
}

type EmailDocumentOptions = {
  preheader: string;
  heading: string;
  content: string;
  footerNote?: string;
  footerLink?: {
    url: string;
    label: string;
  };
};

export function renderEmailDocument({
  preheader,
  heading,
  content,
  footerNote,
  footerLink,
}: EmailDocumentOptions): string {
  const year = new Date().getFullYear();
  const footerNoteHtml = footerNote
    ? `<p style="margin:8px 0 0;">${escapeHtml(footerNote)}</p>`
    : "";
  const footerLinkHtml = footerLink
    ? `<p style="margin:10px 0 0;"><a href="${escapeHtml(footerLink.url)}" style="color:${EMAIL_COLORS.accent};text-decoration:underline;">${escapeHtml(footerLink.label)}</a></p>`
    : "";

  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(heading)}</title>
  <style>
    @media only screen and (max-width: 480px) {
      .email-body-pad {
        padding-left: 22px !important;
        padding-right: 22px !important;
      }
      .email-heading {
        font-size: 22px !important;
      }
      .email-stat-cell {
        display: block !important;
        width: 100% !important;
        padding: 0 0 10px 0 !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.canvas};">
  <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${EMAIL_COLORS.canvas};">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${EMAIL_COLORS.canvas}" style="background-color:${EMAIL_COLORS.canvas};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;background-color:${EMAIL_COLORS.surface};border:1px solid ${EMAIL_COLORS.line};border-radius:18px;">
          <tr>
            <td bgcolor="${EMAIL_COLORS.accent}" style="padding:22px 32px;background-color:${EMAIL_COLORS.accent};border-radius:18px 18px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="34" height="34" align="center" valign="middle" bgcolor="${EMAIL_COLORS.surface}" style="width:34px;height:34px;background-color:${EMAIL_COLORS.surface};border-radius:9px;font-family:${FONT_FAMILY};font-size:17px;font-weight:800;line-height:34px;color:${EMAIL_COLORS.accent};text-align:center;">T</td>
                  <td style="padding-left:12px;font-family:${FONT_FAMILY};font-size:12px;font-weight:700;letter-spacing:0.24em;line-height:1.2;color:${EMAIL_COLORS.surface};text-transform:uppercase;">Tahiry</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-body-pad" style="padding:34px 32px 30px;">
              <h1 class="email-heading" style="margin:0 0 18px;font-family:${FONT_FAMILY};font-size:25px;font-weight:700;line-height:1.25;color:${EMAIL_COLORS.ink};">${escapeHtml(heading)}</h1>
              ${content}
            </td>
          </tr>
          <tr>
            <td class="email-body-pad" style="padding:0 32px;">
              <div style="height:1px;background-color:${EMAIL_COLORS.line};font-size:1px;line-height:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="email-body-pad" style="padding:22px 32px 30px;font-family:${FONT_FAMILY};font-size:12px;line-height:1.6;color:${EMAIL_COLORS.muted};">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${EMAIL_COLORS.ink};">Tahiry</p>
              <p style="margin:0;">Every coin, in plain sight.</p>
              ${footerNoteHtml}
              ${footerLinkHtml}
              <p style="margin:10px 0 0;">&copy; ${year} Tahiry. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderEmailButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px;">
    <tr>
      <td align="center" bgcolor="${EMAIL_COLORS.accent}" style="background-color:${EMAIL_COLORS.accent};border-radius:10px;">
        <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 24px;font-family:${FONT_FAMILY};font-size:15px;font-weight:700;line-height:1.2;color:${EMAIL_COLORS.surface};text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

type EmailCalloutOptions = {
  tone: "info" | "warning";
  title?: string;
  text: string;
};

export function renderEmailCallout({
  tone,
  title,
  text,
}: EmailCalloutOptions): string {
  const palette =
    tone === "warning"
      ? {
          background: EMAIL_COLORS.negativeSoft,
          border: EMAIL_COLORS.negativeLine,
          title: "#991b1b",
          text: "#7f1d1d",
        }
      : {
          background: EMAIL_COLORS.accentSoft,
          border: EMAIL_COLORS.accentInverse,
          title: EMAIL_COLORS.accent,
          text: "#065f46",
        };
  const titleHtml = title
    ? `<p style="margin:0 0 4px;font-size:13px;font-weight:700;line-height:1.5;color:${palette.title};">${escapeHtml(title)}</p>`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${palette.background}" style="margin:22px 0;border-collapse:separate;background-color:${palette.background};border-left:3px solid ${palette.border};border-radius:8px;">
    <tr>
      <td style="padding:14px 16px;font-family:${FONT_FAMILY};">
        ${titleHtml}
        <p style="margin:0;font-size:13px;line-height:1.55;color:${palette.text};">${escapeHtml(text)}</p>
      </td>
    </tr>
  </table>`;
}

export function renderEmailUrlFallback(
  url: string,
  label = "If the button does not work, copy and paste this link into your browser:",
): string {
  const escapedUrl = escapeHtml(url);

  return `<p style="margin:24px 0 8px;font-family:${FONT_FAMILY};font-size:12px;line-height:1.5;color:${EMAIL_COLORS.muted};">${escapeHtml(label)}</p>
  <div style="padding:12px 14px;background-color:${EMAIL_COLORS.subtleSurface};border:1px solid ${EMAIL_COLORS.line};border-radius:8px;font-family:${MONO_FONT_FAMILY};font-size:12px;line-height:1.5;color:${EMAIL_COLORS.body};word-break:break-all;">
    <a href="${escapedUrl}" style="color:${EMAIL_COLORS.accent};text-decoration:underline;">${escapedUrl}</a>
  </div>`;
}

export function renderEmailHighlight(value: string): string {
  return `<div style="margin:4px 0 24px;padding:16px 18px;background-color:${EMAIL_COLORS.subtleSurface};border:1px solid ${EMAIL_COLORS.line};border-radius:10px;font-family:${FONT_FAMILY};font-size:16px;font-weight:700;line-height:1.5;color:${EMAIL_COLORS.ink};word-break:break-all;">${escapeHtml(value)}</div>`;
}

export function renderEmailSectionTitle(text: string): string {
  return `<h2 style="margin:8px 0 12px;font-family:${FONT_FAMILY};font-size:12px;font-weight:700;letter-spacing:0.08em;line-height:1.4;color:${EMAIL_COLORS.muted};text-transform:uppercase;">${escapeHtml(text)}</h2>`;
}
