/**
 * Contrato de eventos de domínio in-process.
 *
 * Sem broker externo nesta fase: o bus vive na memória do cliente e serve para
 * desacoplar use-cases de side-effects (dashboard, e-mail, log). Quando um
 * backend de mensageria existir, estes tipos continuam válidos — só o transporte muda.
 */

export type EventName = string;

export type DomainEvent<TName extends EventName = EventName, TPayload = unknown> = {
  name: TName;
  payload: TPayload;
  /** Tenant no qual o evento ocorreu. Null só para eventos de plataforma. */
  tenantId: string | null;
  occurredAt: string;
  /** Id estável para idempotência / tracing. */
  eventId: string;
  correlationId?: string;
  meta?: Record<string, unknown>;
};

export type EventEnvelope<TEvent extends DomainEvent = DomainEvent> = TEvent;

export type EventHandler<TEvent extends DomainEvent = DomainEvent> = (
  event: TEvent,
) => void | Promise<void>;

export type Unsubscribe = () => void;
