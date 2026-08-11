import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/core/cache";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import {
  getConsumerConsulta,
  getConsumerCreditBalance,
  getConsumerDashboardSummary,
  listConsumerConsultas,
  requestConsumerConsulta,
} from "@/modules/torres-consulta/application/use-cases";
import type { ConsumerConsultaFilters } from "@/modules/torres-consulta/domain/entities/consumer-consulta";
import type { ConsumerConsultaRequestInput } from "@/modules/torres-consulta/schemas/consumer-consulta";
import { invalidateConsumerConsultaQueries } from "@/infra/query/cache-invalidation";

function useConsumerId(): string | undefined {
  const { resolution } = usePrincipal();
  if (resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER) {
    return resolution.consumerProfile.id;
  }
  return undefined;
}

export const consumerConsultaKeys = {
  all: (consumerId: string) => cacheKeys.consumer.consultas(consumerId),
  list: (consumerId: string, filters?: ConsumerConsultaFilters) =>
    [...cacheKeys.consumer.consultas(consumerId), "list", filters ?? {}] as const,
  detail: (consumerId: string, id: string) =>
    cacheKeys.consumer.consultaDetail(consumerId, id),
  credits: (consumerId: string) => cacheKeys.consumer.credits(consumerId),
  dashboard: (consumerId: string) => cacheKeys.consumer.dashboard(consumerId),
};

export function useConsumerConsultas(filters?: ConsumerConsultaFilters) {
  const consumerId = useConsumerId();

  return useQuery({
    queryKey: consumerConsultaKeys.list(consumerId ?? "", filters),
    queryFn: () => listConsumerConsultas(consumerId!, filters),
    enabled: Boolean(consumerId),
  });
}

export function useConsumerConsulta(id: string | undefined) {
  const consumerId = useConsumerId();

  return useQuery({
    queryKey: consumerConsultaKeys.detail(consumerId ?? "", id ?? ""),
    queryFn: () => getConsumerConsulta(consumerId!, id!),
    enabled: Boolean(consumerId && id),
  });
}

export function useConsumerCreditBalance() {
  const consumerId = useConsumerId();

  return useQuery({
    queryKey: consumerConsultaKeys.credits(consumerId ?? ""),
    queryFn: () => getConsumerCreditBalance(consumerId!),
    enabled: Boolean(consumerId),
  });
}

export function useConsumerDashboardSummary() {
  const consumerId = useConsumerId();

  return useQuery({
    queryKey: consumerConsultaKeys.dashboard(consumerId ?? ""),
    queryFn: () => getConsumerDashboardSummary(consumerId!),
    enabled: Boolean(consumerId),
  });
}

export function useRequestConsumerConsulta() {
  const consumerId = useConsumerId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConsumerConsultaRequestInput) =>
      requestConsumerConsulta(consumerId!, input),
    onSuccess: () => {
      if (consumerId) {
        invalidateConsumerConsultaQueries(queryClient, consumerId);
      }
    },
  });
}
