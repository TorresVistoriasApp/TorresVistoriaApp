import type { IntegrationContext, IntegrationResult } from "@/core/integrations/ports/shared";

/**
 * Eventos que o tenant pode assinar para integrar com ERP, CRM ou automações.
 *
 * O nome é parte do contrato público: renomear um evento quebra integrações de
 * clientes, então mudanças exigem versionamento, não edição.
 */
export const WebhookEvent = {
  INSPECTION_CREATED: "inspection.created",
  INSPECTION_COMPLETED: "inspection.completed",
  REPORT_GENERATED: "report.generated",
  CONSULTA_COMPLETED: "consulta.completed",
  PAYMENT_CONFIRMED: "payment.confirmed",
  CREDITS_DEPLETED: "credits.depleted",
  USER_INVITED: "user.invited",
} as const;
export type WebhookEvent = (typeof WebhookEvent)[keyof typeof WebhookEvent];

export interface WebhookSubscription {
  id: string;
  companyId: string;
  url: string;
  events: WebhookEvent[];
  /** Segredo usado para assinar o payload (HMAC). Nunca exposto na leitura. */
  hasSecret: boolean;
  active: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: WebhookEvent;
  status: "pending" | "delivered" | "failed";
  attempts: number;
  responseStatus: number | null;
  lastAttemptAt: string | null;
}

/** Porta de publicação de webhooks com entrega garantida por retentativa. */
export interface WebhookPublisherPort {
  publish(
    context: IntegrationContext,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<IntegrationResult<{ deliveryIds: string[] }>>;

  listSubscriptions(
    context: IntegrationContext,
  ): Promise<IntegrationResult<WebhookSubscription[]>>;

  listDeliveries(
    context: IntegrationContext,
    subscriptionId: string,
  ): Promise<IntegrationResult<WebhookDelivery[]>>;

  /** Reenvia uma entrega que falhou, sem reprocessar a regra de negócio. */
  retry(context: IntegrationContext, deliveryId: string): Promise<IntegrationResult<void>>;
}
