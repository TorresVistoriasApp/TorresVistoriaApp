import { createServiceClient, createUserClient } from "./supabase-client.ts";
import { evaluatePrivilegedGate, extractAalFromRequest } from "./aal.ts";

export async function requirePlatformAdmin(req: Request) {
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
  const { data: admin, error: adminError } = await supabase
    .from("platform_admins")
    .select("id, full_name, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (adminError) throw adminError;

  const gate = evaluatePrivilegedGate({
    hasUser: true,
    isActive: !admin || admin.is_active !== false,
    roleAuthorized: Boolean(admin),
    aal: extractAalFromRequest(req),
  });
  if (!gate.ok) return gate;
  if (!admin) {
    return evaluatePrivilegedGate({
      hasUser: true,
      isActive: true,
      roleAuthorized: false,
      aal: extractAalFromRequest(req),
    });
  }

  return { supabase, admin, adminId: user.id };
}
