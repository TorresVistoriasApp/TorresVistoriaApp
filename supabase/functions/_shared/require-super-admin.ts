import { createServiceClient, createUserClient } from "./supabase-client.ts";
import { evaluatePrivilegedGate, extractAalFromRequest } from "./aal.ts";

export async function requireSuperAdmin(req: Request) {
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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, tenant_id, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .single();

  if (profileError) throw profileError;

  const gate = evaluatePrivilegedGate({
    hasUser: true,
    isActive: profile?.is_active !== false,
    roleAuthorized: profile?.role === "SUPER_ADMIN",
    aal: extractAalFromRequest(req),
  });
  if (!gate.ok) return gate;

  return { supabase, adminProfile: profile, adminId: user.id };
}
