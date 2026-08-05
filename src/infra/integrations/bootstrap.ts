import { registerIntegration } from "@/core/integrations/registry";
import { supabaseFileStorage } from "@/infra/integrations/supabase-file-storage";

/**
 * Vincula os adaptadores disponíveis às portas de integração.
 *
 * Único lugar do código que conhece simultaneamente um contrato e sua
 * implementação — é aqui que se troca de provedor. As integrações ainda sem
 * adaptador permanecem não registradas de propósito: `getIntegration` falha com
 * mensagem explícita e `isIntegrationAvailable` permite à UI esconder o recurso.
 */
export function bootstrapIntegrations(): void {
  registerIntegration("storage", supabaseFileStorage);

  // Pendentes de adaptador — cada linha vira um `registerIntegration`:
  //   payments        → gateway de pagamento (PIX, cartão, boleto)
  //   vehicleLookup   → provedor de consulta veicular
  //   email           → provedor de e-mail transacional
  //   notifications   → push / SMS / WhatsApp
  //   webhooks        → entrega de eventos para sistemas do cliente
  //   credits         → extrato de créditos
  //   coupons         → cupons de desconto
  //   cashback        → devolução sobre compras
  //   pdf             → renderização de PDF fora do browser
}
