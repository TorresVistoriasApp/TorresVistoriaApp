import type { IntegrationContext, IntegrationResult, Money } from "@/core/integrations/ports/shared";

export const CashbackStatus = {
  /** Aguardando o prazo de carência antes de liberar. */
  PENDING: "PENDING",
  /** Disponível para uso. */
  AVAILABLE: "AVAILABLE",
  /** Já convertido em créditos ou resgatado. */
  REDEEMED: "REDEEMED",
  /** Cancelado por estorno da compra original. */
  CANCELED: "CANCELED",
} as const;
export type CashbackStatus = (typeof CashbackStatus)[keyof typeof CashbackStatus];

export interface CashbackEntry {
  id: string;
  status: CashbackStatus;
  /** Percentual aplicado sobre a compra. */
  rate: number;
  amount: Money;
  /** Compra que originou o cashback. */
  referenceId: string;
  earnedAt: string;
  availableAt: string;
  expiresAt: string | null;
}

export interface CashbackSummary {
  available: Money;
  pending: Money;
  lifetimeEarned: Money;
}

/** Porta de cashback: acúmulo sobre compras e resgate em créditos. */
export interface CashbackServicePort {
  getSummary(context: IntegrationContext): Promise<IntegrationResult<CashbackSummary>>;

  listEntries(context: IntegrationContext): Promise<IntegrationResult<CashbackEntry[]>>;

  /** Registra cashback de uma compra confirmada. */
  accrue(
    context: IntegrationContext,
    purchaseAmount: Money,
    referenceId: string,
  ): Promise<IntegrationResult<CashbackEntry>>;

  /** Converte cashback disponível em créditos utilizáveis. */
  redeem(context: IntegrationContext, amount: Money): Promise<IntegrationResult<CashbackEntry>>;
}
