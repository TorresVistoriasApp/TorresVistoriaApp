import { createServiceClient, createUserClient } from "./supabase-client.ts";

export type RegistrationApprover = {
  supabase: ReturnType<typeof createServiceClient>;
  adminId: string;
  /** Empresa fixa do Super Admin do tenant. `null` = operador da plataforma. */
  lockedTenantId: string | null;
};

/**
 * Quem pode analisar cadastro público de vistoriador:
 * operador SaaS ou Super Admin da empresa.
 */
export async function requireRegistrationApprover(req: Request) {
  const userClient = createUserClient(req);
  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return { error: "Sessão não autenticada. Efetue login novamente.", status: 401 as const };
  }

  const supabase = createServiceClient();
  const { data: platformAdmin, error: adminError } = await supabase
    .from("platform_admins")
    .select("id, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (adminError) throw adminError;
  if (platformAdmin && platformAdmin.is_active !== false) {
    return { supabase, adminId: user.id, lockedTenantId: null } satisfies RegistrationApprover;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, tenant_id, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileError) throw profileError;
  if (profile?.is_active === false) {
    return { error: "Esta conta está desativada.", status: 403 as const };
  }
  if (profile?.role === "SUPER_ADMIN" && profile.tenant_id) {
    return {
      supabase,
      adminId: user.id,
      lockedTenantId: profile.tenant_id,
    } satisfies RegistrationApprover;
  }

  return { error: "Você não possui permissão para executar esta operação.", status: 403 as const };
}
