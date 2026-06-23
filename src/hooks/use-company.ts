import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { companyService } from "@/services/company-service";
import type { CompanyInput, SettingsInput } from "@/schemas/settings";
import { useAuth } from "@/hooks/use-auth";

export function useCompany() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.company.detail(profile?.company_id ?? ""),
    queryFn: () => companyService.getCompany(profile!.company_id),
    enabled: !!profile?.company_id,
  });
}

export function useCompanySettings() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.company.settings(profile?.company_id ?? ""),
    queryFn: () => companyService.getSettings(profile!.company_id),
    enabled: !!profile?.company_id,
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (input: CompanyInput) => {
      if (!profile?.company_id) throw new Error("Sessão inválida");
      return companyService.updateCompany(profile.company_id, input);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.company.detail(profile!.company_id) });
    },
  });
}

export function useUpdateCompanySettings() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (input: SettingsInput) => {
      if (!profile?.company_id) throw new Error("Sessão inválida");
      return companyService.updateSettings(profile.company_id, input);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.company.settings(profile!.company_id) });
    },
  });
}

export function useUploadCompanyAsset() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: "logo" | "signature" }) => {
      if (!profile?.company_id) throw new Error("Sessão inválida");
      return companyService.uploadAsset(profile.company_id, file, kind);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.company.detail(profile!.company_id) });
      void qc.invalidateQueries({ queryKey: queryKeys.company.settings(profile!.company_id) });
    },
  });
}
