import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCompanyContext } from "@/app/company-context";
import { useUser } from "@/app/user-context";
import { queryKeys } from "@/lib/queries";
import { companyService } from "@/services/company-service";
import type { CompanyInput, SettingsInput } from "@/schemas/settings";

export function useCompany(companyId?: string) {
  const { companyId: tenantCompanyId } = useUser();
  const { company } = useCompanyContext();
  const resolvedCompanyId = companyId ?? tenantCompanyId ?? "";

  return useQuery({
    queryKey: queryKeys.company.detail(resolvedCompanyId),
    queryFn: () => companyService.getCompany(resolvedCompanyId),
    enabled: !!resolvedCompanyId,
    initialData: resolvedCompanyId === company?.id ? company : undefined,
  });
}

export function useCompanySettings(companyId?: string) {
  const { companyId: tenantCompanyId } = useUser();
  const { company, settings } = useCompanyContext();
  const resolvedCompanyId = companyId ?? tenantCompanyId ?? "";

  return useQuery({
    queryKey: queryKeys.company.settings(resolvedCompanyId),
    queryFn: () => companyService.getSettings(resolvedCompanyId),
    enabled: !!resolvedCompanyId,
    initialData: resolvedCompanyId === company?.id ? settings ?? undefined : undefined,
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  const { companyId } = useUser();
  const { refreshCompany } = useCompanyContext();

  return useMutation({
    mutationFn: (input: CompanyInput) => {
      if (!companyId) throw new Error("Sessão inválida");
      return companyService.updateCompany(companyId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.detail(companyId!) });
      await refreshCompany();
    },
  });
}

export function useUpdateCompanySettings() {
  const qc = useQueryClient();
  const { companyId } = useUser();
  const { refreshCompany } = useCompanyContext();

  return useMutation({
    mutationFn: (input: SettingsInput) => {
      if (!companyId) throw new Error("Sessão inválida");
      return companyService.updateSettings(companyId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.settings(companyId!) });
      await refreshCompany();
    },
  });
}

export function useUploadCompanyAsset() {
  const qc = useQueryClient();
  const { companyId } = useUser();
  const { refreshCompany } = useCompanyContext();

  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: "logo" | "signature" }) => {
      if (!companyId) throw new Error("Sessão inválida");
      return companyService.uploadAsset(companyId, file, kind);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.company.detail(companyId!) });
      await qc.invalidateQueries({ queryKey: queryKeys.company.settings(companyId!) });
      await refreshCompany();
    },
  });
}
