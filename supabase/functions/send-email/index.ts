import { Webhook } from "npm:standardwebhooks@^1";
import { Resend } from "npm:resend@^6";
import { renderTorresConsultaAuthEmail } from "./email-template.ts";

type EmailActionType = "signup" | "recovery" | string;

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
      subject: "Confirme seu e-mail — Torres Consulta",
      title: "Confirme seu endereço de e-mail",
      body:
        "Estamos quase lá! Para ativar sua conta e começar a consultar veículos, confirme seu endereço de e-mail clicando no botão abaixo.",
      ctaLabel: "Confirmar e-mail",
      preheader: "Ative sua conta Torres Consulta em um clique.",
    };
  }

  if (emailActionType === "recovery") {
    return {
      subject: "Redefina sua senha — Torres Consulta",
      title: "Redefina sua senha",
      body:
        "Recebemos uma solicitação para redefinir a senha da sua conta. Se foi você, use o botão abaixo para criar uma nova senha.",
      ctaLabel: "Redefinir senha",
      preheader: "Solicitação de redefinição de senha na Torres Consulta.",
      footnote:
        "Não solicitou esta alteração? Ignore este e-mail — sua senha permanece a mesma.",
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
const resendFromName = Deno.env.get("RESEND_FROM_NAME") ?? "Torres Consulta";
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
      html: renderTorresConsultaAuthEmail({
        title: authEmail.title,
        body: authEmail.body,
        ctaLabel: authEmail.ctaLabel,
        ctaUrl: confirmationUrl,
        preheader: authEmail.preheader,
        footnote: authEmail.footnote,
      }),
    });

    if (error) {
    console.error("[send-email] resend error", {
      name: error instanceof Error ? error.name : "ResendError",
    });
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
    console.error("[send-email] unexpected error", {
      name: error instanceof Error ? error.name : "Error",
    });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
