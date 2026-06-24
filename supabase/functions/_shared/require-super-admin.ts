import { createServiceClient, createUserClient } from "./supabase-client.ts";

export async function requireSuperAdmin(req: Request) {
  const userClient = createUserClient(req);
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return { error: "Sessão não autenticada. Efetue login novamente.", status: 401 as const };
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
    return { error: "Você não possui permissão para executar esta operação.", status: 403 as const };
  }

  return { supabase, adminProfile: profile, adminId: user.id };
}
