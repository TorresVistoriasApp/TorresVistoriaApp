import { createServiceClient, createUserClient } from "./supabase-client.ts";

export async function requirePlatformAdmin(req: Request) {
  const userClient = createUserClient(req);
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return { error: "Sessão não autenticada. Efetue login novamente.", status: 401 as const };
  }

  const supabase = createServiceClient();
  const { data: admin, error: adminError } = await supabase
    .from("platform_admins")
    .select("id, full_name, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!admin || admin.is_active === false) {
    return { error: "Você não possui permissão para executar esta operação.", status: 403 as const };
  }

  return { supabase, admin, adminId: user.id };
}
