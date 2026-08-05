import { EventNames } from "@/core/events";
import type { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";
import type { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";

export type ConsultaRequestedPayload = {
  consultaId: string;
  type: VehicleQueryType;
  plate: string | null;
  chassis: string | null;
  requestedBy: string;
};

export type ConsultaCompletedPayload = {
  consultaId: string;
  type: VehicleQueryType;
  creditsCharged: number;
};

export type ConsultaFailedPayload = {
  consultaId: string;
  type: VehicleQueryType;
  reason: string;
  status: ConsultaStatus;
};

export const ConsultaDomainEvents = {
  requested: EventNames.CONSULTA_REQUESTED,
  completed: EventNames.CONSULTA_COMPLETED,
  failed: EventNames.CONSULTA_FAILED,
} as const;
