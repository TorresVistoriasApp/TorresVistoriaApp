import { isConsultaAvailable } from "@/modules/torres-consulta/domain/services/consulta-availability";
import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import {
  createPendingConsumerConsulta,
  type ConsumerConsulta,
  type ConsumerConsultaFilters,
  type ConsumerCreditBalance,
  type ConsumerDashboardSummary,
} from "@/modules/torres-consulta/domain/entities/consumer-consulta";
import { getConsumerConsultaRepository } from "@/modules/torres-consulta/repositories/consumer-consulta-repository";
import type { ConsumerConsultaRequestInput } from "@/modules/torres-consulta/schemas/consumer-consulta";

const INTEGRATION_PENDING_MESSAGE =
  "Sua consulta foi registrada. O resultado será liberado quando a integração com a fonte de dados estiver ativa.";

/**
 * Solicita uma consulta veicular B2C.
 * Cobrança avulsa por plano (gateway futuro) — preço em reais, sem saldo.
 */
export async function requestConsumerConsulta(
  consumerId: string,
  input: ConsumerConsultaRequestInput,
): Promise<ConsumerConsulta> {
  const repository = getConsumerConsultaRepository();

  const pending = createPendingConsumerConsulta({
    id: globalThis.crypto.randomUUID(),
    consumerId,
    planName: input.planName,
    queryType: input.queryType,
    plate: input.plate,
    chassis: input.chassis,
  });

  const saved = await repository.save(pending);

  if (!isConsultaAvailable()) {
    return { ...saved, failureReason: INTEGRATION_PENDING_MESSAGE };
  }

  return saved;
}

export async function listConsumerConsultas(
  consumerId: string,
  filters?: ConsumerConsultaFilters,
): Promise<ConsumerConsulta[]> {
  return getConsumerConsultaRepository().list(consumerId, filters);
}

export async function getConsumerConsulta(
  consumerId: string,
  id: string,
): Promise<ConsumerConsulta | null> {
  return getConsumerConsultaRepository().findById(consumerId, id);
}

export async function getConsumerCreditBalance(consumerId: string): Promise<ConsumerCreditBalance> {
  return getConsumerConsultaRepository().getCreditBalance(consumerId);
}

export async function getConsumerDashboardSummary(
  consumerId: string,
): Promise<ConsumerDashboardSummary> {
  const repository = getConsumerConsultaRepository();
  const consultas = await repository.list(consumerId);

  const completedConsultas = consultas.filter(
    (item) => item.status === ConsultaStatus.COMPLETED,
  ).length;

  const processingConsultas = consultas.filter(
    (item) => item.status === ConsultaStatus.PROCESSING,
  ).length;

  return {
    totalConsultas: consultas.length,
    completedConsultas,
    processingConsultas,
    lastConsulta: consultas[0] ?? null,
  };
}
