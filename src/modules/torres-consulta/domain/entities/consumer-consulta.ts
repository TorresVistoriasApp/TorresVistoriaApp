import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import type { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

/** Consulta veicular solicitada por consumidor B2C (sem tenant). */
export interface ConsumerConsulta {
  id: string;
  consumerId: string;
  planName: string;
  queryType: VehicleQueryType;
  plate: string | null;
  chassis: string | null;
  status: ConsultaStatus;
  creditsCharged: number;
  failureReason: string | null;
  documentUrl: string | null;
  resultPayload: Record<string, unknown> | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ConsumerConsultaFilters {
  status?: ConsultaStatus;
  search?: string;
}

export interface ConsumerCreditBalance {
  available: number;
  pending: number;
}

export interface ConsumerDashboardSummary {
  totalConsultas: number;
  completedConsultas: number;
  availableCredits: number;
  lastConsulta: ConsumerConsulta | null;
}

export function createPendingConsumerConsulta(input: {
  id: string;
  consumerId: string;
  planName: string;
  queryType: VehicleQueryType;
  plate: string | null;
  chassis: string | null;
}): ConsumerConsulta {
  return {
    id: input.id,
    consumerId: input.consumerId,
    planName: input.planName,
    queryType: input.queryType,
    plate: input.plate,
    chassis: input.chassis,
    status: ConsultaStatus.PROCESSING,
    creditsCharged: 0,
    failureReason: null,
    documentUrl: null,
    resultPayload: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function markConsumerConsultaFailed(
  consulta: ConsumerConsulta,
  reason: string,
): ConsumerConsulta {
  return {
    ...consulta,
    status: ConsultaStatus.FAILED,
    failureReason: reason,
    completedAt: new Date().toISOString(),
  };
}
