import type { PaymentGatewayPort } from "@/core/integrations/ports/payment-gateway";
import type { VehicleLookupPort } from "@/core/integrations/ports/vehicle-lookup";
import type { EmailSenderPort } from "@/core/integrations/ports/email-sender";
import type { NotificationDispatcherPort } from "@/core/integrations/ports/notification-dispatcher";
import type { WebhookPublisherPort } from "@/core/integrations/ports/webhook-publisher";
import type { CreditLedgerPort } from "@/core/integrations/ports/credit-ledger";
import type { CouponServicePort } from "@/core/integrations/ports/coupon-service";
import type { CashbackServicePort } from "@/core/integrations/ports/cashback-service";
import type { PdfRendererPort } from "@/core/integrations/ports/pdf-renderer";
import type { FileStoragePort } from "@/core/integrations/ports/file-storage";

/** Mapa de todas as capacidades externas do ecossistema. */
export interface IntegrationPorts {
  payments: PaymentGatewayPort;
  vehicleLookup: VehicleLookupPort;
  email: EmailSenderPort;
  notifications: NotificationDispatcherPort;
  webhooks: WebhookPublisherPort;
  credits: CreditLedgerPort;
  coupons: CouponServicePort;
  cashback: CashbackServicePort;
  pdf: PdfRendererPort;
  storage: FileStoragePort;
}

export type IntegrationName = keyof IntegrationPorts;

/**
 * Erro lançado ao usar uma integração que ainda não tem adaptador.
 *
 * Falhar alto e com mensagem específica é proposital: um stub silencioso que
 * devolve dados vazios esconderia a ausência de configuração até produção.
 */
export class IntegrationNotConfiguredError extends Error {
  readonly integration: IntegrationName;

  constructor(integration: IntegrationName) {
    super(
      `Integração "${integration}" não configurada. ` +
        `Registre um adaptador com registerIntegration("${integration}", ...) durante o bootstrap.`,
    );
    this.name = "IntegrationNotConfiguredError";
    this.integration = integration;
  }
}

const adapters = new Map<IntegrationName, IntegrationPorts[IntegrationName]>();

/** Vincula um adaptador concreto a uma porta. Chamado apenas no bootstrap. */
export function registerIntegration<Name extends IntegrationName>(
  name: Name,
  adapter: IntegrationPorts[Name],
): void {
  adapters.set(name, adapter);
}

/** Resolve a porta. Lança se nenhum adaptador foi registrado. */
export function getIntegration<Name extends IntegrationName>(name: Name): IntegrationPorts[Name] {
  const adapter = adapters.get(name);
  if (!adapter) throw new IntegrationNotConfiguredError(name);
  return adapter as IntegrationPorts[Name];
}

/** Permite que a UI esconda funcionalidades sem adaptador em vez de quebrar. */
export function isIntegrationAvailable(name: IntegrationName): boolean {
  return adapters.has(name);
}

/** Reinicia o container — usado em testes para isolar cenários. */
export function resetIntegrations(): void {
  adapters.clear();
}
