import { createServiceClient, createUserClient } from "./supabase-client.ts";
import { evaluatePrivilegedGate, extractAalFromRequest } from "./aal.ts";

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
    return evaluatePrivilegedGate({
      hasUser: false,
      isActive: false,
      roleAuthorized: false,
      aal: null,
    });
  }

  const supabase = createServiceClient();
  const { data: platformAdmin, error: adminError } = await supabase
    .from("platform_admins")
    .select("id, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (adminError) throw adminError;

  const aal = extractAalFromRequest(req);

  if (platformAdmin) {
    const gate = evaluatePrivilegedGate({
      hasUser: true,
      isActive: platformAdmin.is_active !== false,
      roleAuthorized: true,
      aal,
    });
    if (!gate.ok) return gate;
    return { supabase, adminId: user.id, lockedTenantId: null } satisfies RegistrationApprover;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, tenant_id, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileError) throw profileError;

  const gate = evaluatePrivilegedGate({
    hasUser: true,
    isActive: profile?.is_active !== false,
    roleAuthorized: profile?.role === "SUPER_ADMIN" && Boolean(profile.tenant_id),
    aal,
  });
  if (!gate.ok) return gate;
  if (!profile?.tenant_id) {
    return evaluatePrivilegedGate({
      hasUser: true,
      isActive: true,
      roleAuthorized: false,
      aal,
    });
  }

  return {
    supabase,
    adminId: user.id,
    lockedTenantId: profile.tenant_id,
  } satisfies RegistrationApprover;
}
