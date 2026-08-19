import { Webhook } from "npm:standardwebhooks@^1";
import { Resend } from "npm:resend@^6";

type EmailActionType = "signup" | "recovery" | string;

function htmlEmailBase({ title, body, ctaLabel, ctaUrl }: { title: string; body: string; ctaLabel: string; ctaUrl: string }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji';">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;">
        <div style="font-size:12px;color:#6b7280;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
          TORRES
        </div>
        <h1 style="margin:12px 0 0 0;font-size:20px;line-height:1.3;color:#0f172a;font-weight:800;">
          ${title}
        </h1>
        <p style="margin:14px 0 0 0;font-size:14px;line-height:1.6;color:#334155;">
          ${body}
        </p>

        <div style="margin-top:20px;">
          <a href="${ctaUrl}"
             style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:800;font-size:14px;">
            ${ctaLabel}
          </a>
        </div>

        <p style="margin:18px 0 0 0;font-size:12px;line-height:1.6;color:#6b7280;">
          Este e-mail foi enviado automaticamente. Não responda.
        </p>
      </div>
      <div style="margin-top:14px;text-align:center;font-size:12px;color:#94a3b8;">
        Torres Consulta / Torres Vistoria
      </div>
    </div>
  </body>
</html>`;
}

function buildVerifyUrl({
  supabaseUrl,
  tokenHash,
  emailActionType,
  redirectTo,
}: {
  supabaseUrl: string;
  tokenHash: string;
  emailActionType: string;
  redirectTo: string;
}) {
  const verifyBase = new URL("/auth/v1/verify", supabaseUrl);
  verifyBase.searchParams.set("token", tokenHash);
  verifyBase.searchParams.set("type", emailActionType);
  verifyBase.searchParams.set("redirect_to", redirectTo);
  return verifyBase.toString();
}

function buildAuthEmail({ emailActionType }: { emailActionType: EmailActionType }) {
  if (emailActionType === "signup") {
    return {
      subject: "Confirme seu endereço de e-mail",
      title: "Confirme seu endereço de e-mail",
      body: "Para concluir seu cadastro, confirme seu endereço de e-mail clicando no botão abaixo.",
      ctaLabel: "Confirmar e-mail",
    };
  }

  if (emailActionType === "recovery") {
    return {
      subject: "Redefina sua senha",
      title: "Redefina sua senha",
      body: "Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar.",
      ctaLabel: "Redefinir senha",
    };
  }

  return null;
}

function normalizeHookSecret(raw: string): string {
  return raw.trim().replace(/^v1,whsec_/, "");
}

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const sendEmailHookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "noreply@torresconsultas.com.br";
const resendFromName = Deno.env.get("RESEND_FROM_NAME") ?? "Torres";
const supabaseUrl = Deno.env.get("SUPABASE_URL");

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY é obrigatório para a função send-email.");
}
if (!sendEmailHookSecret) {
  throw new Error("SEND_EMAIL_HOOK_SECRET é obrigatório para a função send-email.");
}
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL é obrigatório para a função send-email.");
}

const resend = new Resend(resendApiKey);
const hookSecret = normalizeHookSecret(sendEmailHookSecret);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let verified: {
    user: { email: string };
    email_data: {
      token_hash: string;
      redirect_to: string;
      email_action_type: string;
    };
  };

  try {
    const wh = new Webhook(hookSecret);
    verified = wh.verify(payload, headers) as typeof verified;
  } catch (error) {
    const hasWebhookHeaders = Boolean(
      headers["webhook-signature"] ?? headers["Webhook-Signature"],
    );
    console.error("[send-email] webhook verify failed", {
      hasWebhookHeaders,
      message: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: { "Content-Type": "application/json" },
      status: 401,
    });
  }

  try {
    const email = verified.user?.email;
    const { token_hash, redirect_to, email_action_type } = verified.email_data;

    if (!email || !token_hash || !redirect_to || !email_action_type) {
      return new Response("bad request", { status: 400 });
    }

    const confirmationUrl = buildVerifyUrl({
      supabaseUrl,
      tokenHash: token_hash,
      emailActionType: email_action_type,
      redirectTo: redirect_to,
    });

    const authEmail = buildAuthEmail({ emailActionType: email_action_type });
    if (!authEmail) {
      return new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { error } = await resend.emails.send({
      from: `${resendFromName} <${resendFromEmail}>`,
      to: [email],
      subject: authEmail.subject,
      html: htmlEmailBase({
        title: authEmail.title,
        body: authEmail.body,
        ctaLabel: authEmail.ctaLabel,
        ctaUrl: confirmationUrl,
      }),
    });

    if (error) {
      console.error("[send-email] resend error", error);
      return new Response(JSON.stringify({ error: "Resend delivery failed" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[send-email] unexpected error", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
