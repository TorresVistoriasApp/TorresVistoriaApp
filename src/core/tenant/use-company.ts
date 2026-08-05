import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCompanyContext } from "@/core/tenant/company-context";
import { useUser } from "@/core/auth/user-context";
import { queryKeys } from "@/infra/supabase/queries";
import { companyService } from "@/core/tenant/company-service";
import type { CompanyInput, SettingsInput } from "@/core/tenant/schemas/company";

export function useCompany(tenantId?: string) {
  const { tenantId: sessionTenantId } = useUser();
  const { company } = useCompanyContext();
  const resolvedTenantId = tenantId ?? sessionTenantId ?? "";

  return useQuery({
    queryKey: queryKeys.company.detail(resolvedTenantId),
    queryFn: () => companyService.getCompany(resolvedTenantId),
    enabled: !!resolvedTenantId,
    initialData: resolvedTenantId === company?.id ? company : undefined,
  });
}

export function useCompanySettings(tenantId?: string) {
  const { tenantId: sessionTenantId } = useUser();
  const { company, settings } = useCompanyContext();
  const resolvedTenantId = tenantId ?? sessionTenantId ?? "";

  return useQuery({
    queryKey: queryKeys.company.settings(resolvedTenantId),
    queryFn: () => companyService.getSettings(resolvedTenantId),
    enabled: !!resolvedTenantId,
    initialData: resolvedTenantId === company?.id ? settings ?? undefined : undefined,
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  const { tenantId } = useUser();
  const { refreshCompany } = useCompanyContext();

  return useMutation({
    mutationFn: (input: CompanyInput) => {
      if (!tenantId) throw new Error("Sessão inválida");
      return companyService.updateCompany(tenantId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.detail(tenantId!) });
      await refreshCompany();
    },
  });
}

export function useUpdateCompanySettings() {
  const qc = useQueryClient();
  const { tenantId } = useUser();
  const { refreshCompany } = useCompanyContext();

  return useMutation({
    mutationFn: (input: SettingsInput) => {
      if (!tenantId) throw new Error("Sessão inválida");
      return companyService.updateSettings(tenantId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.settings(tenantId!) });
      await refreshCompany();
    },
  });
}

export function useUploadCompanyAsset() {
  const qc = useQueryClient();
  const { tenantId } = useUser();
  const { refreshCompany } = useCompanyContext();

  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: "logo" | "signature" }) => {
      if (!tenantId) throw new Error("Sessão inválida");
      return companyService.uploadAsset(tenantId, file, kind);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.detail(tenantId!) });
      await qc.invalidateQueries({ queryKey: queryKeys.company.settings(tenantId!) });
      await refreshCompany();
    },
  });
}
