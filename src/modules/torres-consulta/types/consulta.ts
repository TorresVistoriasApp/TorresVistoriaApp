import type {
  VehicleFinding,
  VehicleQueryType,
  VehicleSummary,
} from "@/core/integrations/ports/vehicle-lookup";

export const ConsultaStatus = {
  /** Créditos reservados, aguardando resposta do provedor. */
  PROCESSING: "PROCESSING",
  /** Resultado disponível. */
  COMPLETED: "COMPLETED",
  /** Provedor recusou ou falhou; créditos devolvidos. */
  FAILED: "FAILED",
} as const;
export type ConsultaStatus = (typeof ConsultaStatus)[keyof typeof ConsultaStatus];

/** Registro de uma consulta veicular executada pelo tenant. */
export interface Consulta {
  id: string;
  tenantId: string;
  requestedBy: string;
  type: VehicleQueryType;
  status: ConsultaStatus;
  /** Identificador buscado, já normalizado. */
  plate: string | null;
  chassis: string | null;
  /** Créditos efetivamente debitados. Zero quando houve estorno. */
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
