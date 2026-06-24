import { corsHeaders } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase-client.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userClient = createUserClient(req);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
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
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { email, fullName, role } = await req.json();
    if (!email || !fullName || !role) {
      throw new Error("email, fullName e role são obrigatórios");
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
    if (!invited.user) throw new Error("Falha ao convidar usuário");

    const { error: updateError } = await supabase.auth.admin.updateUserById(invited.user.id, {
      app_metadata: {
        company_id: profile.company_id,
        role,
      },
    });

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        userId: invited.user.id,
        message: "Convite enviado por e-mail",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
