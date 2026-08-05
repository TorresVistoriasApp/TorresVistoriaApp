import type { IntegrationContext } from "@/core/integrations/ports/shared";
import type { Consulta, ConsultaFilters } from "@/modules/torres-consulta/domain/entities/consulta";
import { getConsultaRepository } from "@/modules/torres-consulta/repositories/consulta-repository";

export async function listConsultas(
  context: IntegrationContext,
  filters?: ConsultaFilters,
): Promise<Consulta[]> {
  return getConsultaRepository().list(context.tenantId, filters);
}
