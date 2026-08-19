/** Cores e textos alinhados ao site Torres Consulta (globals.css / landing). */
const BRAND = {
  primary: "#ea580c",
  primaryDark: "#c2410c",
  primaryLight: "#f97316",
  ink: "#0f172a",
  slate: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#ffffff",
  canvas: "#eef2f6",
  headerBg: "#0f172a",
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
  preheader?: string;
  footnote?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Botão compatível com Outlook / Hotmail (VML + fallback HTML).
 * Gradientes e <div> dentro de <td> costumam sumir no cliente da Microsoft.
 */
function renderBulletproofButton(label: string, url: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
  <tr>
    <td align="center" style="border-radius:12px;background-color:${BRAND.primary};" bgcolor="${BRAND.primary}">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
        href="${url}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="16%" stroke="f" fillcolor="${BRAND.primary}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Segoe UI,Arial,sans-serif;font-size:16px;font-weight:bold;">
          ${label}
        </center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}"
         target="_blank"
         style="background-color:${BRAND.primary};border:2px solid ${BRAND.primary};border-radius:12px;color:#ffffff;display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:16px;font-weight:700;line-height:50px;text-align:center;text-decoration:none;min-width:240px;padding:0 32px;mso-hide:all;">
        ${label}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

export function renderTorresConsultaAuthEmail(input: AuthEmailTemplateInput): string {
  const title = escapeHtml(input.title);
  const body = escapeHtml(input.body);
  const ctaLabel = escapeHtml(input.ctaLabel);
  const ctaUrl = escapeHtml(input.ctaUrl);
  const preheader = escapeHtml(input.preheader ?? input.title);
  const footnote = input.footnote ? escapeHtml(input.footnote) : "";
  const year = new Date().getFullYear();

  const footnoteBlock = footnote
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
        <tr>
          <td style="padding:16px 18px;border-radius:12px;background-color:#fff7ed;border:1px solid #fed7aa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;line-height:1.55;color:#9a3412;">
            <strong style="display:block;margin-bottom:4px;color:#c2410c;">Aviso de segurança</strong>
            ${footnote}
          </td>
        </tr>
      </table>`
    : "";

  return `<!doctype html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
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
    <style type="text/css">
      table { border-collapse: collapse; }
      td, a, span { font-family: Segoe UI, Arial, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
      @media only screen and (max-width: 620px) {
        .wrapper { width: 100% !important; }
        .content-cell { padding: 28px 22px !important; }
        .header-cell { padding: 28px 22px !important; }
        .hero-title { font-size: 22px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;width:100%;background-color:${BRAND.canvas};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;font-size:1px;line-height:1px;">
      ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.canvas};">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

            <!-- Cabeçalho escuro premium -->
            <tr>
              <td class="header-cell" align="center" style="padding:32px 40px;background-color:${BRAND.headerBg};border-radius:20px 20px 0 0;" bgcolor="${BRAND.headerBg}">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center">
                      <a href="${BRAND.siteUrl}" target="_blank" style="text-decoration:none;">
                        <span style="font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;line-height:1.2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                          Torres <span style="color:${BRAND.primaryLight};">Consulta</span>
                        </span>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:8px;">
                      <span style="font-size:13px;font-weight:500;color:${BRAND.footerText};letter-spacing:0.02em;">
                        ${BRAND.tagline}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width:48px;height:3px;background-color:${BRAND.primary};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                          <td style="width:12px;font-size:0;line-height:0;">&nbsp;</td>
                          <td style="width:24px;height:3px;background-color:${BRAND.primaryLight};border-radius:2px;opacity:0.7;font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Corpo -->
            <tr>
              <td class="content-cell" style="padding:40px 40px 36px;background-color:${BRAND.surface};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};" bgcolor="${BRAND.surface}">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-bottom:20px;">
                      <span style="display:inline-block;padding:7px 14px;border-radius:999px;background-color:#ffedd5;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.primaryDark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        Segurança da conta
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h1 class="hero-title" style="margin:0 0 14px;font-size:26px;line-height:1.25;font-weight:800;color:${BRAND.ink};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        ${title}
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:32px;">
                      <p style="margin:0;font-size:16px;line-height:1.7;color:${BRAND.slate};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        ${body}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:8px;">
                      ${renderBulletproofButton(ctaLabel, ctaUrl)}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:8px;padding-bottom:4px;">
                      <span style="font-size:12px;color:${BRAND.muted};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        O link expira em breve por motivos de segurança.
                      </span>
                    </td>
                  </tr>
                </table>

                ${footnoteBlock}

                <!-- Fallback link -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;border-top:1px solid ${BRAND.border};">
                  <tr>
                    <td style="padding-top:20px;">
                      <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:${BRAND.muted};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        Problemas com o botão? Copie e cole o endereço abaixo no navegador:
                      </p>
                      <p style="margin:0;font-size:11px;line-height:1.6;word-break:break-all;font-family:Consolas,'Courier New',monospace;">
                        <a href="${ctaUrl}" target="_blank" style="color:${BRAND.primary};text-decoration:underline;">${ctaUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Rodapé do card -->
            <tr>
              <td style="padding:24px 40px;background-color:#f8fafc;border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 20px 20px;" bgcolor="#f8fafc">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center">
                      <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:${BRAND.muted};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        Mensagem automática — não responda a este e-mail.
                      </p>
                      <p style="margin:0;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        <a href="${BRAND.siteUrl}" target="_blank" style="color:${BRAND.primary};text-decoration:none;font-weight:700;">
                          torresconsultas.com.br
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Barra inferior -->
            <tr>
              <td align="center" style="padding:20px 12px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="padding:14px 20px;background-color:${BRAND.footerBg};border-radius:12px;" bgcolor="${BRAND.footerBg}">
                      <span style="font-size:11px;color:${BRAND.footerText};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                        © ${year} Torres Consulta · Ecossistema Torres
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
