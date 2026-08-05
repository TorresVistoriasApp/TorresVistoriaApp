import { logger } from "@/core/observability/logger";
import type { DomainEvent, EventHandler, EventName, Unsubscribe } from "@/core/events/types";

type HandlerEntry = {
  name: EventName | "*";
  handler: EventHandler;
};

const handlers = new Set<HandlerEntry>();

function newEventId(): string {
  return globalThis.crypto.randomUUID();
}

/**
 * Publica um evento para todos os handlers inscritos no nome (e nos coringas `*`).
 *
 * Handlers assíncronos rodam em paralelo; uma falha isolada não impede os demais
 * nem propaga para o publisher — side-effects quebrados não devem abortar o
 * use-case que já commitou o estado.
 */
export async function publish<TPayload>(
  name: EventName,
  payload: TPayload,
  options?: {
    tenantId?: string | null;
    correlationId?: string;
    meta?: Record<string, unknown>;
    occurredAt?: string;
    eventId?: string;
  },
): Promise<DomainEvent<EventName, TPayload>> {
  const event: DomainEvent<EventName, TPayload> = {
    name,
    payload,
    tenantId: options?.tenantId ?? null,
    occurredAt: options?.occurredAt ?? new Date().toISOString(),
    eventId: options?.eventId ?? newEventId(),
    correlationId: options?.correlationId,
    meta: options?.meta,
  };

  const targets = [...handlers].filter(
    (entry) => entry.name === "*" || entry.name === name,
  );

  await Promise.all(
    targets.map(async (entry) => {
      try {
        await entry.handler(event as DomainEvent);
      } catch (error) {
        logger.error("Falha em handler de evento", { name, error });
      }
    }),
  );

  return event;
}

/** Inscreve um handler em um nome específico ou em todos (`*`). */
export function subscribe<TEvent extends DomainEvent = DomainEvent>(
  name: EventName | "*",
  handler: EventHandler<TEvent>,
): Unsubscribe {
  const entry: HandlerEntry = {
    name,
    handler: handler as EventHandler,
  };
  handlers.add(entry);
  return () => {
    handlers.delete(entry);
  };
}

/** Remove todos os handlers. Útil em testes. */
export function resetEventBus(): void {
  handlers.clear();
}

export const eventBus = {
  publish,
  subscribe,
  reset: resetEventBus,
};
