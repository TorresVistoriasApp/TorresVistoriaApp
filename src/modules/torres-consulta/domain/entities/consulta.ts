import type {
  VehicleFinding,
  VehicleQueryType,
  VehicleSummary,
} from "@/core/integrations/ports/vehicle-lookup";

export const ConsultaStatus = {
  /** Aguardando resposta do provedor. */
  PROCESSING: "PROCESSING",
  /** Resultado disponível. */
  COMPLETED: "COMPLETED",
  /** Provedor recusou ou falhou. */
  FAILED: "FAILED",
} as const;
export type ConsultaStatus = (typeof ConsultaStatus)[keyof typeof ConsultaStatus];

/** Agregado raiz: uma consulta veicular executada pelo tenant. */
export interface Consulta {
  id: string;
  tenantId: string;
  requestedBy: string;
  type: VehicleQueryType;
  status: ConsultaStatus;
  plate: string | null;
  chassis: string | null;
  creditsCharged: number;
  vehicle: VehicleSummary | null;
  findings: VehicleFinding[];
  documentUrl: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ConsultaFilters {
  type?: VehicleQueryType;
  status?: ConsultaStatus;
  search?: string;
}

export function createPendingConsulta(input: {
  id: string;
  tenantId: string;
  requestedBy: string;
  type: VehicleQueryType;
  plate: string | null;
  chassis: string | null;
}): Consulta {
  return {
    id: input.id,
    tenantId: input.tenantId,
    requestedBy: input.requestedBy,
    type: input.type,
    status: ConsultaStatus.PROCESSING,
    plate: input.plate,
    chassis: input.chassis,
    creditsCharged: 0,
    vehicle: null,
    findings: [],
    documentUrl: null,
    failureReason: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

export function markConsultaFailed(consulta: Consulta, reason: string): Consulta {
  return {
    ...consulta,
    status: ConsultaStatus.FAILED,
    failureReason: reason,
    completedAt: new Date().toISOString(),
  };
}

export function markConsultaCompleted(
  consulta: Consulta,
  data: {
    creditsCharged: number;
    vehicle: VehicleSummary | null;
    findings: VehicleFinding[];
    documentUrl: string | null;
  },
): Consulta {
  return {
    ...consulta,
    status: ConsultaStatus.COMPLETED,
    creditsCharged: data.creditsCharged,
    vehicle: data.vehicle,
    findings: data.findings,
    documentUrl: data.documentUrl,
    completedAt: new Date().toISOString(),
  };
}
