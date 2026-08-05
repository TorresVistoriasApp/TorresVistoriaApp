import type { IntegrationContext } from "@/core/integrations/ports/shared";
import { AppError } from "@/core/errors/app-error";
import type { Consulta } from "@/modules/torres-consulta/domain/entities/consulta";
import { getConsultaRepository } from "@/modules/torres-consulta/repositories/consulta-repository";

export async function getConsulta(
  context: IntegrationContext,
  id: string,
): Promise<Consulta> {
  const consulta = await getConsultaRepository().findById(context.tenantId, id);
  if (!consulta) throw new AppError("Consulta não encontrada.", "NOT_FOUND");
  return consulta;
}
