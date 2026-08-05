import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenantContext } from "@/core/tenant/tenant-context";
import { useUser } from "@/core/auth/user-context";
import { queryKeys } from "@/infra/supabase/queries";
import { companyService } from "@/core/tenant/company-service";
import type { CompanyInput, SettingsInput } from "@/core/tenant/schemas/company";

/** Dados da empresa do tenant ativo (ou de um tenant explícito). */
export function useTenant(tenantId?: string) {
  const { tenantId: sessionTenantId } = useUser();
  const { company } = useTenantContext();
  const resolvedTenantId = tenantId ?? sessionTenantId ?? "";

  return useQuery({
    queryKey: queryKeys.company.detail(resolvedTenantId),
    queryFn: () => companyService.getCompany(resolvedTenantId),
    enabled: !!resolvedTenantId,
    initialData: resolvedTenantId === company?.id ? company : undefined,
  });
}

export function useTenantSettings(tenantId?: string) {
  const { tenantId: sessionTenantId } = useUser();
  const { company, settings } = useTenantContext();
  const resolvedTenantId = tenantId ?? sessionTenantId ?? "";

  return useQuery({
    queryKey: queryKeys.company.settings(resolvedTenantId),
    queryFn: () => companyService.getSettings(resolvedTenantId),
    enabled: !!resolvedTenantId,
    initialData: resolvedTenantId === company?.id ? settings ?? undefined : undefined,
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  const { tenantId } = useUser();
  const { refreshTenant } = useTenantContext();

  return useMutation({
    mutationFn: (input: CompanyInput) => {
      if (!tenantId) throw new Error("Sessão inválida");
      return companyService.updateCompany(tenantId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.detail(tenantId!) });
      await refreshTenant();
    },
  });
}

export function useUpdateTenantSettings() {
  const qc = useQueryClient();
  const { tenantId } = useUser();
  const { refreshTenant } = useTenantContext();

  return useMutation({
    mutationFn: (input: SettingsInput) => {
      if (!tenantId) throw new Error("Sessão inválida");
      return companyService.updateSettings(tenantId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.settings(tenantId!) });
      await refreshTenant();
    },
  });
}

export function useUploadTenantAsset() {
  const qc = useQueryClient();
  const { tenantId } = useUser();
  const { refreshTenant } = useTenantContext();

  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: "logo" | "signature" }) => {
      if (!tenantId) throw new Error("Sessão inválida");
      return companyService.uploadAsset(tenantId, file, kind);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.detail(tenantId!) });
      await qc.invalidateQueries({ queryKey: queryKeys.company.settings(tenantId!) });
      await refreshTenant();
    },
  });
}

/** @deprecated Use `useTenant`. Mantido só durante a transição de naming. */
export const useCompany = useTenant;
/** @deprecated Use `useTenantSettings`. */
export const useCompanySettings = useTenantSettings;
/** @deprecated Use `useUpdateTenant`. */
export const useUpdateCompany = useUpdateTenant;
/** @deprecated Use `useUpdateTenantSettings`. */
export const useUpdateCompanySettings = useUpdateTenantSettings;
/** @deprecated Use `useUploadTenantAsset`. */
export const useUploadCompanyAsset = useUploadTenantAsset;
