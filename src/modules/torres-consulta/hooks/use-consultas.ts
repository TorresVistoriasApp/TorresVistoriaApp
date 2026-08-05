import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { consultaService } from "@/modules/torres-consulta/services/consulta-service";
import { useConsultaContext } from "@/modules/torres-consulta/hooks/use-consulta-context";
import type { ConsultaFilters } from "@/modules/torres-consulta/types/consulta";
import type { ConsultaRequestInput } from "@/modules/torres-consulta/schemas/consulta";

export const consultaKeys = {
  all: ["consulta"] as const,
  list: (tenantId: string, filters?: ConsultaFilters) =>
    [...consultaKeys.all, "list", tenantId, filters ?? {}] as const,
  detail: (tenantId: string, id: string) =>
    [...consultaKeys.all, "detail", tenantId, id] as const,
};

export function useConsultas(filters?: ConsultaFilters) {
  const context = useConsultaContext();

  return useQuery({
    queryKey: consultaKeys.list(context?.tenantId ?? "", filters),
    queryFn: () => consultaService.list(context!, filters),
    enabled: Boolean(context),
  });
}

export function useConsulta(id: string | undefined) {
  const context = useConsultaContext();

  return useQuery({
    queryKey: consultaKeys.detail(context?.tenantId ?? "", id ?? ""),
    queryFn: () => consultaService.getById(context!, id!),
    enabled: Boolean(context && id),
  });
}

export function useRequestConsulta() {
  const context = useConsultaContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConsultaRequestInput) => consultaService.request(context!, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: consultaKeys.all });
    },
  });
}
