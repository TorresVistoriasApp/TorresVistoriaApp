/** Tipos compartilhados pelos contratos de integração. */

/**
 * Valor monetário em centavos.
 *
 * Nunca usar ponto flutuante para dinheiro: `0.1 + 0.2 !== 0.3` em IEEE-754, e
 * o erro se acumula em somatórios de faturamento.
 */
export type Money = {
  /** Valor inteiro em centavos. Ex.: R$ 149,90 -> 14990. */
  amountInCents: number;
  currency: "BRL";
};

export const brl = (amountInCents: number): Money => ({ amountInCents, currency: "BRL" });

/**
 * Resultado de operação que pode falhar por motivo de negócio.
 *
 * Integrações externas falham o tempo todo (saldo insuficiente, cupom expirado,
 * provedor fora do ar). Modelar isso no tipo de retorno obriga o chamador a
 * tratar a falha, em vez de descobri-la como exceção em produção.
 */
export type IntegrationResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

/** Identificação do tenant e do ator que originou a operação. */
export type IntegrationContext = {
  tenantId: string;
  userId: string;
  /** Chave de idempotência: evita cobrança dupla em retry de rede. */
  idempotencyKey?: string;
};
