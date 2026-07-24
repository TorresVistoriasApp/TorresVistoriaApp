import { createServiceClient, createUserClient } from "./supabase-client.ts";

export type AuthorizedCaller = {
  /** Só é devolvido depois que a identidade do chamador foi confirmada. */
  supabase: ReturnType<typeof createServiceClient>;
  userId: string;
  role: string;
  companyId: string;
};

export type AuthFailure = { error: string; status: 401 | 403 };

export function isAuthFailure(result: AuthorizedCaller | AuthFailure): result is AuthFailure {
  return (result as AuthFailure).error !== undefined;
}

/** Valida o JWT enviado pelo cliente e carrega o perfil correspondente. */
export async function requireCaller(req: Request): Promise<AuthorizedCaller | AuthFailure> {
  const {
    data: { user },
    error: authError,
  } = await createUserClient(req).auth.getUser();

  if (authError || !user) {
    return { error: "Sessão não autenticada. Efetue login novamente.", status: 401 };
  }

  const supabase = createServiceClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id, is_active")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) {
    return { error: "Perfil não encontrado para a sessão atual.", status: 403 };
  }
  if (profile.is_active === false) {
    return { error: "Esta conta está desativada.", status: 403 };
  }

  return {
    supabase,
    userId: user.id,
    role: profile.role,
    companyId: profile.company_id,
  };
}

/**
 * Uma vistoria pertence ao vistoriador responsável e ao super admin da mesma
 * empresa. Chamadores de outra empresa nunca têm acesso.
 */
export function canAccessInspection(
  caller: AuthorizedCaller,
  inspection: { company_id: string; inspector_id: string },
): boolean {
  if (inspection.company_id !== caller.companyId) return false;
  if (caller.role === "SUPER_ADMIN") return true;
  return inspection.inspector_id === caller.userId;
}
