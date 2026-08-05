/**
 * Event bus in-process do Ecossistema Torres.
 *
 * Use-cases publicam; side-effects se inscrevem. Nenhum módulo deve importar
 * outro módulo só para "avisar que algo aconteceu".
 */

export { eventBus, publish, subscribe, resetEventBus } from "@/core/events/event-bus";
export { EventNames, type KnownEventName } from "@/core/events/event-names";
export type {
  DomainEvent,
  EventEnvelope,
  EventHandler,
  EventName,
  Unsubscribe,
} from "@/core/events/types";
