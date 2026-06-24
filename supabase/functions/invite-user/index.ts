import { corsHeaders } from "../_shared/cors.ts";
import { jsonErrorResponse } from "../_shared/auth-errors.ts";
import { validatePassword } from "../_shared/password-policy.ts";
import { requireSuperAdmin } from "../_shared/require-super-admin.ts";

const ALLOWED_ROLES = ["SUPER_ADMIN", "VISTORIADOR"] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

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
    const action = body.action as string | undefined;

    if (action === "create" || body.password) {
      const { email, fullName, role, password } = body;
      if (!email || !fullName || !role || !password) {
        throw new Error("Informe nome, e-mail, função e senha inicial.");
      }
      if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        throw new Error("A função informada é inválida.");
      }

      const passwordError = validatePassword(password);
      if (passwordError) throw new Error(passwordError);

      const normalizedEmail = String(email).trim().toLowerCase();

      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
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
      if (!created.user) throw new Error("Não foi possível concluir o cadastro do usuário.");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          email: normalizedEmail,
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
        throw new Error("Informe usuário, nome, e-mail e função.");
      }
      if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        throw new Error("A função informada é inválida.");
      }

      const { data: target, error: targetError } = await supabase
        .from("profiles")
        .select("id, company_id, email")
        .eq("id", userId)
        .is("deleted_at", null)
        .single();

      if (targetError) throw targetError;
      if (target.company_id !== adminProfile.company_id) {
        throw new Error("O usuário selecionado não pertence à sua empresa.");
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
        throw new Error("Informe o usuário e o status de acesso desejado.");
      }
      if (userId === adminId && !isActive) {
        throw new Error("Não é permitido desativar a própria conta de acesso.");
      }

      const { data: target, error: targetError } = await supabase
        .from("profiles")
        .select("id, company_id")
        .eq("id", userId)
        .is("deleted_at", null)
        .single();

      if (targetError) throw targetError;
      if (target.company_id !== adminProfile.company_id) {
        throw new Error("O usuário selecionado não pertence à sua empresa.");
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

    const { email, fullName, role } = body;
    if (!email || !fullName || !role) {
      throw new Error("Informe nome, e-mail e função.");
    }

    const origin = req.headers.get("origin") ?? Deno.env.get("SITE_URL") ?? "";
    const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: { full_name: fullName },
        redirectTo: origin ? `${origin}/login` : undefined,
      },
    );

    if (inviteError) throw inviteError;
    if (!invited.user) throw new Error("Não foi possível concluir o envio do convite.");

    const { error: updateError } = await supabase.auth.admin.updateUserById(invited.user.id, {
      app_metadata: {
        company_id: adminProfile.company_id,
        role,
      },
    });

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        userId: invited.user.id,
        message: "Convite enviado por e-mail com sucesso.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonErrorResponse(message, corsHeaders);
  }
});
