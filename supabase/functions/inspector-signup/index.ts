import { getCorsHeaders } from "../_shared/cors.ts";
import { jsonErrorResponse } from "../_shared/auth-errors.ts";
import { validatePassword } from "../_shared/password-policy.ts";
import { createServiceClient } from "../_shared/supabase-client.ts";
import {
  checkRateLimit,
  clientKey,
  consumePersistentRateLimit,
  rateLimitedResponse,
} from "../_shared/rate-limit.ts";
import { TurnstileError, verifyTurnstileToken } from "../_shared/turnstile.ts";
import {
  isValidInspectorDocument,
  normalizeDocumentDigits,
} from "../_shared/inspector-document-validate.ts";

function sanitizeEmail(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let intentId: string | null = null;
  const supabase = createServiceClient();

  try {
    const ip = clientKey(req);
    const memoryLimit = checkRateLimit(`inspector-signup:${ip}`, 5, 15 * 60 * 1000);
    if (!memoryLimit.allowed) {
      return rateLimitedResponse(corsHeaders, memoryLimit.retryAfterSec);
    }
    const persisted = await consumePersistentRateLimit(
      supabase,
      `inspector-signup:${ip}`,
      5,
      15 * 60,
    );
    if (!persisted.allowed) {
      return rateLimitedResponse(corsHeaders, persisted.retryAfterSec);
    }

    const body = (await req.json()) as Record<string, unknown>;
    await verifyTurnstileToken(body.captchaToken, ip);
    const name = String(body.name ?? "").trim();
    const email = sanitizeEmail(body.email);
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const documentType = body.documentType === "cnpj" ? "cnpj" : body.documentType === "cpf" ? "cpf" : "";
    const documentDigits = normalizeDocumentDigits(String(body.document ?? ""));
    const acceptTerms = body.acceptTerms === true;

    if (name.length < 2) throw new Error("Informe seu nome completo");
    if (!email.includes("@")) throw new Error("E-mail inválido");
    if (!acceptTerms) throw new Error("É necessário aceitar os termos para criar a conta");
    if (documentType !== "cpf" && documentType !== "cnpj") {
      throw new Error("Tipo de documento inválido para cadastro de vistoriador.");
    }
    if (!isValidInspectorDocument(documentDigits, documentType)) {
      throw new Error(documentType === "cpf" ? "CPF inválido." : "CNPJ inválido.");
    }
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);

    const { data: prepared, error: prepareError } = await supabase.rpc("prepare_inspector_signup", {
      p_digits: documentDigits,
      p_document_type: documentType,
    });
    if (prepareError || typeof prepared !== "string") {
      throw new Error(prepareError?.message ?? "Não foi possível iniciar o cadastro.");
    }
    intentId = prepared;

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: name,
        phone: phone || undefined,
        user_type: "inspector",
        document_type: documentType,
        signup_intent_id: intentId,
      },
    });

    if (createError) throw createError;
    if (!created.user) throw new Error("Não foi possível concluir o cadastro.");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    if (intentId) {
      await supabase.rpc("discard_inspector_signup_intent", { p_intent_id: intentId });
    }
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    const status = error instanceof TurnstileError ? 403 : 400;
    return jsonErrorResponse(message, corsHeaders, status);
  }
});
