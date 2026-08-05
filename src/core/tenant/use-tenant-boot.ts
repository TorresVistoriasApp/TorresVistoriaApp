import { useAuth } from "@/core/auth/use-auth";
import { useTenantContext } from "@/core/tenant/tenant-context";
import { useUser } from "@/core/auth/user-context";
import { usePermission } from "@/core/rbac/use-permission";

/**
 * Estado unificado do boot pós-login: sessão → perfil → empresa/config → permissões.
 */
export function useTenantBoot() {
  const { session, isPlatformAdmin, loading: authLoading } = useAuth();
  const { profile, tenantId } = useUser();
  const { company, settings, plan, loading: companyLoading, error: companyError } =
    useTenantContext();
  const { permissions, loading: permissionLoading } = usePermission();

  const needsTenant = !!session && !isPlatformAdmin && !!tenantId;
  const loading =
    authLoading || permissionLoading || (needsTenant && companyLoading);

  return {
    session,
    profile,
    company,
    settings,
    plan,
    permissions,
    isPlatformAdmin,
    loading,
    companyError,
    ready: !!session && !loading,
  };
}
