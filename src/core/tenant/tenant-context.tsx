import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/core/auth/auth-context";
import { useUser } from "@/core/auth/user-context";
import { queryClient } from "@/infra/query/query-client";
import { queryKeys } from "@/infra/supabase/queries";
import { logger } from "@/core/observability/logger";
import {
  companyService,
  type Company,
  type CompanySettings,
} from "@/core/tenant/company-service";
import { resolveTenant, resolvedTenantId } from "@/core/tenant/tenant-resolver";

/**
 * Estado do tenant ativo na sessão.
 *
 * A entidade de negócio continua sendo `companies` no banco; este contexto é a
 * API pública de isolamento multi-tenant no frontend.
 */
export interface TenantContextValue {
  tenantId: string | null;
  company: Company | null;
  settings: CompanySettings | null;
  /** Plano SaaS da empresa (`companies.subscription_plan`). */
  plan: string | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

async function loadTenantData(tenantId: string): Promise<{
  company: Company;
  settings: CompanySettings | null;
}> {
  const [company, settings] = await Promise.all([
    companyService.getCompany(tenantId),
    companyService.getSettings(tenantId),
  ]);

  queryClient.setQueryData(queryKeys.company.detail(tenantId), company);
  queryClient.setQueryData(queryKeys.company.settings(tenantId), settings);

  return { company, settings };
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantId, loading: userLoading, profile } = useUser();
  const { isPlatformAdmin, session } = useAuth();
  const tenant = resolvedTenantId(
    resolveTenant({
      hasSession: Boolean(session),
      isPlatformAdmin,
      sessionTenantId: tenantId ?? profile?.tenant_id,
    }),
  );

  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTenant = useCallback(async () => {
    if (!tenant) {
      setCompany(null);
      setSettings(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await loadTenantData(tenant);
      setCompany(data.company);
      setSettings(data.settings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar empresa";
      logger.error("Erro ao recarregar tenant", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    if (userLoading || !tenant) {
      setCompany(null);
      setSettings(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);

    void loadTenantData(tenant)
      .then((data) => {
        if (!isActive) return;
        setCompany(data.company);
        setSettings(data.settings);
      })
      .catch((err) => {
        if (!isActive) return;
        const message = err instanceof Error ? err.message : "Erro ao carregar empresa";
        logger.error("Erro ao carregar tenant no login", message);
        setError(message);
        setCompany(null);
        setSettings(null);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [userLoading, tenant]);

  const value = useMemo(
    () => ({
      tenantId: tenant,
      company,
      settings,
      plan: company?.subscription_plan ?? null,
      loading,
      error,
      refreshTenant,
    }),
    [tenant, company, settings, loading, error, refreshTenant],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenantContext deve ser usado dentro de TenantProvider");
  }
  return context;
}
