import { getCorsHeaders } from "../_shared/cors.ts";
import { jsonErrorResponse } from "../_shared/auth-errors.ts";
import { validatePassword } from "../_shared/password-policy.ts";
import { requirePlatformAdmin } from "../_shared/require-platform-admin.ts";
import { enforceCallerRateLimit } from "../_shared/rate-limit.ts";

const DEFAULT_INSPECTION_TYPES = [
  { name: "Vistoria Cautelar", amount: 350.0, sort_order: 1 },
  { name: "Vistoria para Venda", amount: 300.0, sort_order: 2 },
  { name: "Vistoria Detran", amount: 250.0, sort_order: 3 },
  { name: "Vistoria Judicial", amount: 400.0, sort_order: 4 },
  { name: "Vistoria Seguradora", amount: 350.0, sort_order: 5 },
  { name: "Vistoria Leilão", amount: 280.0, sort_order: 6 },
];

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requirePlatformAdmin(req);
    if ("error" in auth) {
      return new Response(JSON.stringify({ error: auth.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: auth.status,
      });
    }

    const { supabase, adminId } = auth;
    const limited = await enforceCallerRateLimit(
      req,
      supabase,
      "onboard",
      adminId,
      5,
      15 * 60,
      corsHeaders,
    );
    if (limited) return limited;

    const body = await req.json();

    const {
      tradeName,
      legalName,
      document,
      companyEmail,
      companyPhone,
      subscriptionPlan,
      adminFullName,
      adminEmail,
      adminPassword,
    } = body;

    if (!tradeName || !adminFullName || !adminEmail || !adminPassword) {
      throw new Error(
        "Informe nome fantasia da empresa, nome, e-mail e senha inicial do administrador.",
      );
    }

    const passwordError = validatePassword(adminPassword);
    if (passwordError) throw new Error(passwordError);

    const allowedPlans = ["starter", "professional", "enterprise"];
    const plan = allowedPlans.includes(subscriptionPlan) ? subscriptionPlan : "starter";

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        trade_name: tradeName,
        legal_name: legalName || null,
        document: document || null,
        email: companyEmail || null,
        phone: companyPhone || null,
        subscription_plan: plan,
        status: "trial",
      })
      .select("*")
      .single();

    if (companyError) throw companyError;

    const normalizedEmail = String(adminEmail).trim().toLowerCase();

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
        must_change_password: true,
      },
      app_metadata: {
        tenant_id: company.id,
        role: "SUPER_ADMIN",
      },
    });

    if (createError) {
      await supabase.from("companies").delete().eq("id", company.id);
      throw createError;
    }
    if (!created.user) {
      await supabase.from("companies").delete().eq("id", company.id);
      throw new Error("Não foi possível concluir o cadastro do administrador da empresa.");
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: adminFullName,
        role: "SUPER_ADMIN",
        email: normalizedEmail,
        must_change_password: true,
        is_active: true,
      })
      .eq("id", created.user.id);

    if (profileError) throw profileError;

    await supabase.from("settings").insert({ tenant_id: company.id });

    await supabase.from("inspection_types").insert(
      DEFAULT_INSPECTION_TYPES.map((type) => ({ ...type, tenant_id: company.id })),
    );

    return new Response(
      JSON.stringify({
        success: true,
        tenantId: company.id,
        adminUserId: created.user.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonErrorResponse(message, corsHeaders);
  }
});
