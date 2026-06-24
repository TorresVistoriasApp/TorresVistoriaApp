import { db } from "@/lib/db-client";
import type { UserRole } from "@/lib/enums";
import { getErrorMessage } from "@/lib/errors";

export interface AuthContext {
  userId: string | null;
  companyId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

export async function getAuthContext(): Promise<AuthContext> {
  try {
    const { data: { user }, error } = await db.auth.getUser();
    if (error) throw error;

    if (!user) {
      return {
        userId: null,
        companyId: null,
        role: null,
        isAuthenticated: false,
        isSuperAdmin: false,
      };
    }

    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (profileError) throw profileError;

    const role = (profile?.role as UserRole | undefined) ?? null;

    return {
      userId: user.id,
      companyId: profile?.company_id ?? null,
      role,
      isAuthenticated: true,
      isSuperAdmin: role === "SUPER_ADMIN",
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function requireAuth(context: AuthContext): void {
  if (!context.isAuthenticated) {
    throw new Error("Autenticação necessária");
  }
}

export function requireSuperAdmin(context: AuthContext): void {
  requireAuth(context);
  if (!context.isSuperAdmin) {
    throw new Error("Acesso restrito a administradores");
  }
}

export function requireCompanyAccess(context: AuthContext, targetCompanyId: string): void {
  requireAuth(context);
  if (context.companyId !== targetCompanyId && !context.isSuperAdmin) {
    throw new Error("Acesso não autorizado a esta empresa");
  }
}

export function canEditInspection(context: AuthContext, inspectionInspectorId: string): boolean {
  if (!context.isAuthenticated) return false;
  if (context.isSuperAdmin) return true;
  return context.userId === inspectionInspectorId;
}

export function canViewInspection(context: AuthContext, inspectionCompanyId: string): boolean {
  if (!context.isAuthenticated) return false;
  if (context.isSuperAdmin) return true;
  return context.companyId === inspectionCompanyId;
}
