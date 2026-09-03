import { getCorsHeaders } from "../_shared/cors.ts";
import { jsonErrorResponse } from "../_shared/auth-errors.ts";
import { requireRegistrationApprover } from "../_shared/require-registration-approver.ts";
import { enforceCallerRateLimit } from "../_shared/rate-limit.ts";
import {
  hmacInspectorDocument,
  indexInspectorDocumentHashes,
  legacySha256DocumentHex,
} from "../_shared/inspector-document-hash.ts";

const ALLOWED_ROLES = ["SUPER_ADMIN", "INSPECTOR"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function normalizeDocumentDigits(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireRegistrationApprover(req);
    if ("error" in auth) {
      return new Response(JSON.stringify({ error: auth.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: auth.status,
      });
    }

    const { supabase, adminId, lockedTenantId } = auth;
    const limited = await enforceCallerRateLimit(
      req,
      supabase,
      "inspector-registrations",
      adminId,
      20,
      15 * 60,
      corsHeaders,
    );
    if (limited) return limited;

    const body = await req.json();
    const action = body.action as string | undefined;

    if (action === "list") {
      const { data: registrations, error } = await supabase
        .from("inspector_registrations")
        .select("*")
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id, trade_name, document")
        .is("deleted_at", null);

      if (companiesError) throw companiesError;

      const companyByHash = new Map<string, { id: string; trade_name: string }>();
      const hmacByDigits = new Map<string, string>();
      for (const company of companies ?? []) {
        const digits = normalizeDocumentDigits(company.document);
        if (!digits) continue;
        let hmacHex = hmacByDigits.get(digits);
        if (!hmacHex) {
          hmacHex = await hmacInspectorDocument(supabase, digits);
          hmacByDigits.set(digits, hmacHex);
        }
        const legacySha256Hex = await legacySha256DocumentHex(digits);
        indexInspectorDocumentHashes(
          companyByHash,
          { id: company.id, trade_name: company.trade_name },
          [hmacHex, legacySha256Hex],
        );
      }

      const items = (registrations ?? []).map((registration) => {
        const suggested =
          registration.document_type === "cnpj"
            ? companyByHash.get(registration.document_hash)
            : null;
        return {
          ...registration,
          suggestedTenantId: suggested?.id ?? null,
          suggestedTenantName: suggested?.trade_name ?? null,
        };
      });

      return new Response(JSON.stringify({ items }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "approve") {
      const { registrationId, role } = body;
      const tenantId = lockedTenantId ?? body.tenantId;
      if (!registrationId || !tenantId || !role) {
        throw new Error("Informe cadastro, empresa e função para aprovação.");
      }
      if (lockedTenantId && body.tenantId && body.tenantId !== lockedTenantId) {
        throw new Error("Você só pode vincular o cadastro à sua empresa.");
      }
      if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        throw new Error("A função informada é inválida.");
      }

      const { data: registration, error: registrationError } = await supabase
        .from("inspector_registrations")
        .select("*")
        .eq("id", registrationId)
        .eq("status", "pending_approval")
        .maybeSingle();

      if (registrationError) throw registrationError;
      if (!registration) throw new Error("Cadastro pendente não encontrado.");

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("id")
        .eq("id", tenantId)
        .is("deleted_at", null)
        .maybeSingle();

      if (companyError) throw companyError;
      if (!company) throw new Error("Empresa selecionada não encontrada.");

      const { data: existingProfile, error: profileLookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", registrationId)
        .maybeSingle();

      if (profileLookupError) throw profileLookupError;
      if (existingProfile) throw new Error("Este usuário já possui perfil operacional.");

      const { error: profileInsertError } = await supabase.from("profiles").insert({
        id: registration.id,
        tenant_id: tenantId,
        full_name: registration.full_name,
        role,
        email: registration.email,
        phone: registration.phone,
        must_change_password: false,
        is_active: true,
        status: "ACTIVE",
      });

      if (profileInsertError) throw profileInsertError;

      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(registration.id, {
        app_metadata: {
          tenant_id: tenantId,
          role,
        },
      });

      if (authUpdateError) throw authUpdateError;

      const { error: registrationUpdateError } = await supabase
        .from("inspector_registrations")
        .update({
          status: "approved",
          approved_tenant_id: tenantId,
          approved_role: role,
          approved_by: adminId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", registrationId);

      if (registrationUpdateError) throw registrationUpdateError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "reject") {
      const { registrationId, rejectionReason } = body;
      if (!registrationId) {
        throw new Error("Informe o cadastro a ser recusado.");
      }

      const reason =
        typeof rejectionReason === "string" && rejectionReason.trim()
          ? rejectionReason.trim()
          : "Cadastro não aprovado pela equipe Torres.";

      const { error: registrationUpdateError } = await supabase
        .from("inspector_registrations")
        .update({
          status: "rejected",
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
        })
        .eq("id", registrationId)
        .eq("status", "pending_approval");

      if (registrationUpdateError) throw registrationUpdateError;

      const { error: banError } = await supabase.auth.admin.updateUserById(registrationId, {
        ban_duration: "876000h",
      });
      if (banError) throw banError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Ação inválida.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonErrorResponse(message, corsHeaders);
  }
});
