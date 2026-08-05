import { getIntegration, isIntegrationAvailable } from "@/core/integrations/registry";
import type { IntegrationContext } from "@/core/integrations/ports/shared";
import { AppError } from "@/core/errors/app-error";
import { getQueryCost } from "@/modules/torres-consulta/domain/query-catalog";
import { getConsultaRepository } from "@/modules/torres-consulta/repositories/consulta-repository";
import { ConsultaStatus, type Consulta, type ConsultaFilters } from "@/modules/torres-consulta/types/consulta";
import type { ConsultaRequestInput } from "@/modules/torres-consulta/schemas/consulta";

/** Motivos de indisponibilidade que a UI trata como estado, não como erro. */
export const ConsultaUnavailableReason = {
  PROVIDER: "PROVIDER",
  CREDITS: "CREDITS",
} as const;
export type ConsultaUnavailableReason =
  (typeof ConsultaUnavailableReason)[keyof typeof ConsultaUnavailableReason];

/** Integrações que faltam para o módulo operar. Vazio significa pronto. */
export function missingIntegrations(): ConsultaUnavailableReason[] {
  const missing: ConsultaUnavailableReason[] = [];
  if (!isIntegrationAvailable("vehicleLookup")) missing.push(ConsultaUnavailableReason.PROVIDER);
  if (!isIntegrationAvailable("credits")) missing.push(ConsultaUnavailableReason.CREDITS);
  return missing;
}

export function isConsultaAvailable(): boolean {
  return missingIntegrations().length === 0;
}

function newConsultaId(): string {
  return globalThis.crypto.randomUUID();
}

export const consultaService = {
  async list(context: IntegrationContext, filters?: ConsultaFilters): Promise<Consulta[]> {
    return getConsultaRepository().list(context.tenantId, filters);
  },

  async getById(context: IntegrationContext, id: string): Promise<Consulta> {
    const consulta = await getConsultaRepository().findById(context.tenantId, id);
    if (!consulta) throw new AppError("Consulta não encontrada.", "NOT_FOUND");
    return consulta;
  },

  /**
   * Executa uma consulta veicular.
   *
   * Os créditos são reservados antes de chamar o provedor e só liquidados após
   * a resposta: se a fonte falhar, a reserva é liberada e o cliente não paga por
   * um resultado que não recebeu.
   */
  async request(context: IntegrationContext, input: ConsultaRequestInput): Promise<Consulta> {
    if (!isConsultaAvailable()) {
      throw new AppError(
        "Consulta veicular indisponível: integração não configurada.",
        "INTEGRATION_UNAVAILABLE",
      );
    }

    const repository = getConsultaRepository();
    const credits = getIntegration("credits");
    const provider = getIntegration("vehicleLookup");

    const id = newConsultaId();
    const cost = getQueryCost(input.type);

    const pending: Consulta = {
      id,
      tenantId: context.tenantId,
      requestedBy: context.userId,
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
    await repository.save(pending);

    const reservation = await credits.reserve(context, cost, id);
    if (!reservation.ok) {
      return repository.save({
        ...pending,
        status: ConsultaStatus.FAILED,
        failureReason: reservation.message,
        completedAt: new Date().toISOString(),
      });
    }

    const identifier = input.plate ? { plate: input.plate } : { chassis: input.chassis! };
    const result = await provider.query(context, { identifier, type: input.type });

    if (!result.ok) {
      await credits.release(context, reservation.data.reservationId);
      return repository.save({
        ...pending,
        status: ConsultaStatus.FAILED,
        failureReason: result.message,
        completedAt: new Date().toISOString(),
      });
    }

    await credits.settle(context, reservation.data.reservationId);

    return repository.save({
      ...pending,
      status: ConsultaStatus.COMPLETED,
      creditsCharged: cost,
      vehicle: result.data.vehicle,
      findings: result.data.findings,
      documentUrl: result.data.documentUrl,
      completedAt: new Date().toISOString(),
    });
  },
};
