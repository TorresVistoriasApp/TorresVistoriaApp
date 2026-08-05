import { publish } from "@/core/events";
import { getIntegration } from "@/core/integrations/registry";
import type { IntegrationContext } from "@/core/integrations/ports/shared";
import { AppError } from "@/core/errors/app-error";
import { metrics, withSpan } from "@/core/observability";
import { getQueryCost } from "@/modules/torres-consulta/domain/query-catalog";
import {
  createPendingConsulta,
  markConsultaCompleted,
  markConsultaFailed,
  type Consulta,
} from "@/modules/torres-consulta/domain/entities/consulta";
import { ConsultaDomainEvents } from "@/modules/torres-consulta/domain/events/consulta-events";
import { isConsultaAvailable } from "@/modules/torres-consulta/domain/services/consulta-availability";
import { getConsultaRepository } from "@/modules/torres-consulta/repositories/consulta-repository";
import type { ConsultaRequestInput } from "@/modules/torres-consulta/schemas/consulta";

/**
 * Caso de uso: comprar/executar uma consulta veicular.
 *
 * Orquestra créditos → provedor → persistência → eventos de domínio.
 * Side-effects (e-mail, dashboard) devem se inscrever no event bus, não aqui.
 */
export async function requestConsulta(
  context: IntegrationContext,
  input: ConsultaRequestInput,
): Promise<Consulta> {
  return withSpan("consulta.request", async () => {
    if (!isConsultaAvailable()) {
      throw new AppError(
        "Consulta veicular indisponível: integração não configurada.",
        "INTEGRATION_UNAVAILABLE",
      );
    }

    const repository = getConsultaRepository();
    const credits = getIntegration("credits");
    const provider = getIntegration("vehicleLookup");

    const id = globalThis.crypto.randomUUID();
    const cost = getQueryCost(input.type);

    const pending = createPendingConsulta({
      id,
      tenantId: context.tenantId,
      requestedBy: context.userId,
      type: input.type,
      plate: input.plate,
      chassis: input.chassis,
    });
    await repository.save(pending);

    await publish(
      ConsultaDomainEvents.requested,
      {
        consultaId: id,
        type: input.type,
        plate: input.plate,
        chassis: input.chassis,
        requestedBy: context.userId,
      },
      { tenantId: context.tenantId, correlationId: id },
    );

    const reservation = await credits.reserve(context, cost, id);
    if (!reservation.ok) {
      const failed = await repository.save(markConsultaFailed(pending, reservation.message));
      await publish(
        ConsultaDomainEvents.failed,
        {
          consultaId: id,
          type: input.type,
          reason: reservation.message,
          status: failed.status,
        },
        { tenantId: context.tenantId, correlationId: id },
      );
      metrics.increment("consulta.failed", 1, { reason: "credits" });
      return failed;
    }

    const identifier = input.plate ? { plate: input.plate } : { chassis: input.chassis! };
    const result = await provider.query(context, { identifier, type: input.type });

    if (!result.ok) {
      await credits.release(context, reservation.data.reservationId);
      const failed = await repository.save(markConsultaFailed(pending, result.message));
      await publish(
        ConsultaDomainEvents.failed,
        {
          consultaId: id,
          type: input.type,
          reason: result.message,
          status: failed.status,
        },
        { tenantId: context.tenantId, correlationId: id },
      );
      metrics.increment("consulta.failed", 1, { reason: "provider" });
      return failed;
    }

    await credits.settle(context, reservation.data.reservationId);

    const completed = await repository.save(
      markConsultaCompleted(pending, {
        creditsCharged: cost,
        vehicle: result.data.vehicle,
        findings: result.data.findings,
        documentUrl: result.data.documentUrl,
      }),
    );

    await publish(
      ConsultaDomainEvents.completed,
      {
        consultaId: id,
        type: input.type,
        creditsCharged: cost,
      },
      { tenantId: context.tenantId, correlationId: id },
    );
    metrics.increment("consulta.completed", 1, { type: input.type });

    return completed;
  });
}
