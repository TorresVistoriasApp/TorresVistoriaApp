import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase-client.ts";

const ALLOWED_ROLES = ["SUPER_ADMIN", "VISTORIADOR"] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Senha deve conter uma letra maiúscula";
  if (!/[a-z]/.test(password)) return "Senha deve conter uma letra minúscula";
  if (!/[0-9]/.test(password)) return "Senha deve conter um número";
  if (!/[^A-Za-z0-9]/.test(password)) return "Senha deve conter um caractere especial";
  return null;
}

async function requireSuperAdmin(req: Request) {
  const userClient = createUserClient(req);
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return { error: "Não autenticado", status: 401 as const };
  }

  const supabase = createServiceClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .is("deleted_at", null)
    .single();

  if (profileError) throw profileError;
  if (profile?.role !== "SUPER_ADMIN") {
    return { error: "Acesso negado", status: 403 as const };
  }

  return { supabase, adminProfile: profile, adminId: user.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireSuperAdmin(req);
    if ("error" in auth) {
      return new Response(JSON.stringify({ error: auth.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: auth.status,
      });
    }

    const { supabase, adminProfile, adminId } = auth;
    const body = await req.json();
    const action = body.action as string;

    if (action === "create") {
      const { email, fullName, role, password } = body;
      if (!email || !fullName || !role || !password) {
        throw new Error("email, fullName, role e password são obrigatórios");
      }
      if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        throw new Error("Função inválida");
      }

      const passwordError = validatePassword(password);
      if (passwordError) throw new Error(passwordError);

      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: String(email).trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          must_change_password: true,
        },
        app_metadata: {
          company_id: adminProfile.company_id,
          role,
        },
      });

      if (createError) throw createError;
      if (!created.user) throw new Error("Falha ao criar usuário");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          email: String(email).trim().toLowerCase(),
          must_change_password: true,
          is_active: true,
        })
        .eq("id", created.user.id);

      if (profileError) throw profileError;

      return new Response(
        JSON.stringify({ success: true, userId: created.user.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    if (action === "update") {
      const { userId, email, fullName, role } = body;
      if (!userId || !email || !fullName || !role) {
        throw new Error("userId, email, fullName e role são obrigatórios");
      }
      if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        throw new Error("Função inválida");
      }

      const { data: target, error: targetError } = await supabase
        .from("profiles")
        .select("id, company_id, email")
        .eq("id", userId)
        .is("deleted_at", null)
        .single();

      if (targetError) throw targetError;
      if (target.company_id !== adminProfile.company_id) {
        throw new Error("Usuário não pertence à sua empresa");
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const authUpdates: Record<string, unknown> = {
        user_metadata: { full_name: fullName },
        app_metadata: { company_id: adminProfile.company_id, role },
      };

      if (normalizedEmail !== target.email) {
        authUpdates.email = normalizedEmail;
      }

      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
      if (authUpdateError) throw authUpdateError;

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          email: normalizedEmail,
        })
        .eq("id", userId);

      if (profileUpdateError) throw profileUpdateError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "set-active") {
      const { userId, isActive } = body;
      if (!userId || typeof isActive !== "boolean") {
        throw new Error("userId e isActive são obrigatórios");
      }
      if (userId === adminId && !isActive) {
        throw new Error("Você não pode desativar sua própria conta");
      }

      const { data: target, error: targetError } = await supabase
        .from("profiles")
        .select("id, company_id")
        .eq("id", userId)
        .is("deleted_at", null)
        .single();

      if (targetError) throw targetError;
      if (target.company_id !== adminProfile.company_id) {
        throw new Error("Usuário não pertence à sua empresa");
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("id", userId);

      if (profileUpdateError) throw profileUpdateError;

      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: isActive ? "none" : "876000h",
      });

      if (authUpdateError) throw authUpdateError;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Ação inválida");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
