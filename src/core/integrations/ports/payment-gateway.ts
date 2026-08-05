import type { IntegrationContext, IntegrationResult, Money } from "@/core/integrations/ports/shared";

/** Meios de pagamento previstos para o Ecossistema Torres. */
export const PaymentMethod = {
  PIX: "PIX",
  CREDIT_CARD: "CREDIT_CARD",
  BOLETO: "BOLETO",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
  CANCELED: "CANCELED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface ChargeRequest {
  amount: Money;
  method: PaymentMethod;
  description: string;
  /** Identificador do recurso pago (ex.: id da consulta veicular). */
  referenceId: string;
  metadata?: Record<string, string>;
}

export interface Charge {
  id: string;
  status: PaymentStatus;
  amount: Money;
  method: PaymentMethod;
  /** URL de checkout ou payload do PIX, conforme o meio escolhido. */
  actionUrl: string | null;
  qrCode: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface RefundRequest {
  chargeId: string;
  /** Ausente devolve o valor integral. */
  amount?: Money;
  reason: string;
}

/**
 * Porta do gateway de pagamento.
 *
 * O núcleo conhece apenas este contrato; trocar de adquirente (Stripe, Pagar.me,
 * Asaas) é escrever um novo adaptador em `@/infra/integrations` e registrá-lo.
 */
export interface PaymentGatewayPort {
  createCharge(
    context: IntegrationContext,
    request: ChargeRequest,
  ): Promise<IntegrationResult<Charge>>;

  getCharge(context: IntegrationContext, chargeId: string): Promise<IntegrationResult<Charge>>;

  refund(context: IntegrationContext, request: RefundRequest): Promise<IntegrationResult<Charge>>;

  /**
   * Valida a assinatura de um webhook do provedor.
   *
   * Sem isso qualquer requisição forjada marcaria uma cobrança como paga; por
   * isso a verificação faz parte do contrato, não do adaptador.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean;
}
