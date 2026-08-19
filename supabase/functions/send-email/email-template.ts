/** Cores e textos alinhados ao site Torres Consulta (globals.css / landing). */
const BRAND = {
  primary: "#ea580c",
  primaryDark: "#c2410c",
  primaryLight: "#f97316",
  ink: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#ffffff",
  canvas: "#f1f5f9",
  footerBg: "#0f172a",
  footerText: "#94a3b8",
  siteUrl: "https://www.torresconsultas.com.br",
  tagline: "Consulta veicular para você",
} as const;

export type AuthEmailTemplateInput = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  /** Texto curto exibido na pré-visualização do cliente de e-mail. */
  preheader?: string;
  /** Rodapé extra (ex.: aviso de segurança no recovery). */
  footnote?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderTorresConsultaAuthEmail(input: AuthEmailTemplateInput): string {
  const title = escapeHtml(input.title);
  const body = escapeHtml(input.body);
  const ctaLabel = escapeHtml(input.ctaLabel);
  const ctaUrl = escapeHtml(input.ctaUrl);
  const preheader = escapeHtml(input.preheader ?? input.title);
  const footnote = input.footnote ? escapeHtml(input.footnote) : "";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .content-pad { padding: 28px 20px !important; }
        .brand-title { font-size: 22px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.canvas};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.canvas};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

            <!-- Header de marca -->
            <tr>
              <td style="padding:0 0 20px 0;text-align:center;">
                <a href="${BRAND.siteUrl}" style="text-decoration:none;display:inline-block;">
                  <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;color:${BRAND.ink};line-height:1.2;">
                    Torres <span style="color:${BRAND.primary};">Consulta</span>
                  </div>
                  <div style="margin-top:4px;font-size:12px;font-weight:500;color:${BRAND.muted};">
                    ${BRAND.tagline}
                  </div>
                </a>
              </td>
            </tr>

            <!-- Card principal -->
            <tr>
              <td style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
                <!-- Faixa superior laranja -->
                <div style="height:4px;background:linear-gradient(90deg,${BRAND.primaryDark} 0%,${BRAND.primary} 50%,${BRAND.primaryLight} 100%);"></div>

                <div class="content-pad" style="padding:36px 32px 32px;">
                  <div style="display:inline-block;margin-bottom:20px;padding:6px 12px;border-radius:999px;background:rgba(234,88,12,0.1);font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.primaryDark};">
                    Conta Torres Consulta
                  </div>

                  <h1 class="brand-title" style="margin:0 0 12px;font-size:24px;line-height:1.25;font-weight:800;color:${BRAND.ink};">
                    ${title}
                  </h1>

                  <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#334155;">
                    ${body}
                  </p>

                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="border-radius:14px;background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryLight} 100%);">
                        <a href="${ctaUrl}"
                           style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:14px;">
                          ${ctaLabel} →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                    Se o botão não funcionar, copie e cole este link no navegador:<br />
                    <a href="${ctaUrl}" style="color:${BRAND.primary};word-break:break-all;">${ctaUrl}</a>
                  </p>

                  ${
                    footnote
                      ? `<p style="margin:20px 0 0;padding:14px 16px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;font-size:12px;line-height:1.55;color:#9a3412;">
                    ${footnote}
                  </p>`
                      : ""
                  }
                </div>
              </td>
            </tr>

            <!-- Rodapé -->
            <tr>
              <td style="padding:24px 8px 0;text-align:center;">
                <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${BRAND.muted};">
                  Este e-mail foi enviado automaticamente. Não responda a esta mensagem.
                </p>
                <p style="margin:0 0 16px;font-size:12px;line-height:1.5;color:${BRAND.muted};">
                  <a href="${BRAND.siteUrl}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">torresconsultas.com.br</a>
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="background:${BRAND.footerBg};border-radius:14px;padding:16px 20px;text-align:center;">
                      <span style="font-size:11px;color:${BRAND.footerText};">
                        © ${new Date().getFullYear()} Torres Consulta · Ecossistema Torres
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
