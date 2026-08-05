import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/core/cache";
import {
  getConsulta,
  listConsultas,
  requestConsulta,
} from "@/modules/torres-consulta/application/use-cases";
import { useConsultaContext } from "@/modules/torres-consulta/hooks/use-consulta-context";
import type { ConsultaFilters } from "@/modules/torres-consulta/domain/entities/consulta";
import type { ConsultaRequestInput } from "@/modules/torres-consulta/schemas/consulta";
import { invalidateConsultaQueries } from "@/infra/query/cache-invalidation";

export const consultaKeys = {
  all: (tenantId: string) => cacheKeys.consulta.all(tenantId),
  list: (tenantId: string, filters?: ConsultaFilters) =>
    [...cacheKeys.consulta.all(tenantId), "list", filters ?? {}] as const,
  detail: (tenantId: string, id: string) => cacheKeys.consulta.detail(tenantId, id),
};

export function useConsultas(filters?: ConsultaFilters) {
  const context = useConsultaContext();

  return useQuery({
    queryKey: consultaKeys.list(context?.tenantId ?? "", filters),
    queryFn: () => listConsultas(context!, filters),
    enabled: Boolean(context),
  });
}

export function useConsulta(id: string | undefined) {
  const context = useConsultaContext();

  return useQuery({
    queryKey: consultaKeys.detail(context?.tenantId ?? "", id ?? ""),
    queryFn: () => getConsulta(context!, id!),
    enabled: Boolean(context && id),
  });
}

export function useRequestConsulta() {
  const context = useConsultaContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConsultaRequestInput) => requestConsulta(context!, input),
    onSuccess: () => {
      if (context?.tenantId) {
        invalidateConsultaQueries(queryClient, context.tenantId);
      }
    },
  });
}
