import type { IntegrationContext, IntegrationResult, Money } from "@/core/integrations/ports/shared";

/**
 * Movimentações de crédito. O saldo é sempre derivado do extrato, nunca um
 * contador mutável: auditoria e conciliação financeira exigem rastro completo.
 */
export const CreditEntryType = {
  /** Compra de créditos pelo cliente. */
  PURCHASE: "PURCHASE",
  /** Consumo em uma consulta. */
  CONSUMPTION: "CONSUMPTION",
  /** Estorno de consumo (consulta falhou na fonte). */
  REFUND: "REFUND",
  /** Bônus concedido por cupom ou campanha. */
  BONUS: "BONUS",
  /** Devolução percentual sobre consumo. */
  CASHBACK: "CASHBACK",
  /** Ajuste manual do operador da plataforma. */
  ADJUSTMENT: "ADJUSTMENT",
  /** Créditos vencidos. */
  EXPIRATION: "EXPIRATION",
} as const;
export type CreditEntryType = (typeof CreditEntryType)[keyof typeof CreditEntryType];

export interface CreditEntry {
  id: string;
  type: CreditEntryType;
  /** Positivo credita, negativo debita. */
  amount: number;
  balanceAfter: number;
  description: string;
  /** Recurso que originou o lançamento (consulta, cobrança, cupom). */
  referenceId: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface CreditBalance {
  available: number;
  /** Reservados por operações em andamento. */
  pending: number;
  /** Próximo vencimento, quando os créditos expiram. */
  nextExpirationAt: string | null;
}

export interface CreditPackage {
  id: string;
  label: string;
  credits: number;
  price: Money;
  /** Créditos extras inclusos na compra. */
  bonusCredits: number;
}

/**
 * Porta do sistema de créditos.
 *
 * `reserve`/`settle` existem para que uma consulta não debite antes de ser
 * confirmada pela fonte: reserva-se na entrada e liquida-se ou libera-se ao
 * final, evitando cobrar por consulta que falhou.
 */
export interface CreditLedgerPort {
  getBalance(context: IntegrationContext): Promise<IntegrationResult<CreditBalance>>;

  listEntries(
    context: IntegrationContext,
    options?: { limit?: number; cursor?: string },
  ): Promise<IntegrationResult<CreditEntry[]>>;

  listPackages(): Promise<IntegrationResult<CreditPackage[]>>;

  /** Bloqueia créditos para uma operação em andamento. */
  reserve(
    context: IntegrationContext,
    amount: number,
    referenceId: string,
  ): Promise<IntegrationResult<{ reservationId: string }>>;

  /** Converte a reserva em consumo definitivo. */
  settle(
    context: IntegrationContext,
    reservationId: string,
  ): Promise<IntegrationResult<CreditEntry>>;

  /** Devolve a reserva quando a operação não se concretiza. */
  release(context: IntegrationContext, reservationId: string): Promise<IntegrationResult<void>>;

  credit(
    context: IntegrationContext,
    entry: Pick<CreditEntry, "type" | "amount" | "description" | "referenceId">,
  ): Promise<IntegrationResult<CreditEntry>>;
}
