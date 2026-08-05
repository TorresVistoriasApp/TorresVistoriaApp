import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/app/company-context";
import { usePermission } from "@/hooks/use-permission";

/**
 * Estado unificado do boot pós-login: sessão → perfil → empresa/config → permissões.
 */
export function useTenantBoot() {
  const { session, profile, isPlatformAdmin, loading: authLoading } = useAuth();
  const { company, settings, plan, loading: companyLoading, error: companyError } =
    useCompanyContext();
  const { permissions, loading: permissionLoading } = usePermission();

  const needsTenant = !!session && !isPlatformAdmin && !!profile?.company_id;
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
