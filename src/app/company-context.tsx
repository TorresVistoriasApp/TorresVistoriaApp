import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/auth-context";
import { useUser } from "@/app/user-context";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/queries";
import { logger } from "@/lib/logger";
import {
  companyService,
  type Company,
  type CompanySettings,
} from "@/services/company-service";

interface CompanyContextValue {
  companyId: string | null;
  company: Company | null;
  settings: CompanySettings | null;
  /** Plano SaaS da empresa (`companies.subscription_plan`). */
  plan: string | null;
  loading: boolean;
  error: string | null;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

async function loadTenantData(companyId: string): Promise<{
  company: Company;
  settings: CompanySettings | null;
}> {
  const [company, settings] = await Promise.all([
    companyService.getCompany(companyId),
    companyService.getSettings(companyId),
  ]);

  queryClient.setQueryData(queryKeys.company.detail(companyId), company);
  queryClient.setQueryData(queryKeys.company.settings(companyId), settings);

  return { company, settings };
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { companyId, loading: userLoading, profile } = useUser();
  const { isPlatformAdmin, session } = useAuth();
  const resolvedCompanyId = companyId ?? profile?.company_id ?? null;

  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCompany = useCallback(async () => {
    if (!resolvedCompanyId || isPlatformAdmin) {
      setCompany(null);
      setSettings(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await loadTenantData(resolvedCompanyId);
      setCompany(data.company);
      setSettings(data.settings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar empresa";
      logger.error("Erro ao recarregar tenant", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [resolvedCompanyId, isPlatformAdmin]);

  useEffect(() => {
    if (userLoading || !session || isPlatformAdmin || !resolvedCompanyId) {
      setCompany(null);
      setSettings(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isActive = true;
    setLoading(true);
    setError(null);

    void loadTenantData(resolvedCompanyId)
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
  }, [userLoading, session, isPlatformAdmin, resolvedCompanyId]);

  const value = useMemo(
    () => ({
      companyId: resolvedCompanyId,
      company,
      settings,
      plan: company?.subscription_plan ?? null,
      loading,
      error,
      refreshCompany,
    }),
    [resolvedCompanyId, company, settings, loading, error, refreshCompany],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanyContext deve ser usado dentro de CompanyProvider");
  }
  return context;
}
