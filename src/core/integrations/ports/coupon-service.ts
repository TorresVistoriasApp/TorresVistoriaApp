import type { IntegrationContext, IntegrationResult, Money } from "@/core/integrations/ports/shared";

export const DiscountType = {
  /** Percentual sobre o valor da compra. */
  PERCENTAGE: "PERCENTAGE",
  /** Valor fixo abatido. */
  FIXED: "FIXED",
  /** Créditos concedidos sem desconto no preço. */
  BONUS_CREDITS: "BONUS_CREDITS",
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export interface Coupon {
  code: string;
  discountType: DiscountType;
  /** Percentual (0-100), centavos ou quantidade de créditos, conforme o tipo. */
  value: number;
  minPurchase: Money | null;
  validFrom: string;
  validUntil: string | null;
  /** Ausente significa uso ilimitado. */
  maxRedemptions: number | null;
  redemptionsCount: number;
  /** Limita o cupom a um produto do ecossistema. */
  productId: string | null;
  active: boolean;
}

export interface CouponApplication {
  coupon: Coupon;
  originalAmount: Money;
  discountAmount: Money;
  finalAmount: Money;
  bonusCredits: number;
}

/**
 * Porta de cupons.
 *
 * `validate` é separado de `redeem` porque a UI precisa mostrar o desconto antes
 * do pagamento, e só consumir o cupom quando a cobrança for confirmada.
 */
export interface CouponServicePort {
  validate(
    context: IntegrationContext,
    code: string,
    amount: Money,
  ): Promise<IntegrationResult<CouponApplication>>;

  redeem(
    context: IntegrationContext,
    code: string,
    referenceId: string,
  ): Promise<IntegrationResult<CouponApplication>>;
}
