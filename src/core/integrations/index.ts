/**
 * API pública da camada de integrações (arquitetura de portas e adaptadores).
 *
 * Módulos consomem capacidades externas exclusivamente por aqui. Nenhum módulo
 * importa um SDK de provedor diretamente — assim trocar de fornecedor não
 * atravessa a base de código.
 */

export {
  getIntegration,
  registerIntegration,
  isIntegrationAvailable,
  resetIntegrations,
  IntegrationNotConfiguredError,
  type IntegrationPorts,
  type IntegrationName,
} from "@/core/integrations/registry";

export { brl, type Money, type IntegrationResult, type IntegrationContext } from "@/core/integrations/ports/shared";

export type { PaymentGatewayPort } from "@/core/integrations/ports/payment-gateway";
export { PaymentMethod, PaymentStatus } from "@/core/integrations/ports/payment-gateway";

export type {
  VehicleLookupPort,
  VehicleQueryRequest,
  VehicleQueryResult,
  VehicleSummary,
  VehicleFinding,
  VehicleIdentifier,
} from "@/core/integrations/ports/vehicle-lookup";
export { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

export type { EmailSenderPort } from "@/core/integrations/ports/email-sender";
export { EmailTemplate } from "@/core/integrations/ports/email-sender";

export type { NotificationDispatcherPort } from "@/core/integrations/ports/notification-dispatcher";
export {
  NotificationChannel,
  NotificationPriority,
} from "@/core/integrations/ports/notification-dispatcher";

export type { WebhookPublisherPort } from "@/core/integrations/ports/webhook-publisher";
export { WebhookEvent } from "@/core/integrations/ports/webhook-publisher";

export type {
  CreditLedgerPort,
  CreditBalance,
  CreditEntry,
  CreditPackage,
} from "@/core/integrations/ports/credit-ledger";
export { CreditEntryType } from "@/core/integrations/ports/credit-ledger";

export type { CouponServicePort, Coupon, CouponApplication } from "@/core/integrations/ports/coupon-service";
export { DiscountType } from "@/core/integrations/ports/coupon-service";

export type { CashbackServicePort, CashbackEntry, CashbackSummary } from "@/core/integrations/ports/cashback-service";
export { CashbackStatus } from "@/core/integrations/ports/cashback-service";

export type { PdfRendererPort, PdfRenderRequest, RenderedPdf } from "@/core/integrations/ports/pdf-renderer";
export { PdfDocumentType } from "@/core/integrations/ports/pdf-renderer";

export type { FileStoragePort, StoredFile, UploadOptions } from "@/core/integrations/ports/file-storage";

export {
  IntegrationProvider,
  IntegrationStatus,
  type IntegrationConnection,
  type TenantInvitation,
  type CompanyBranch,
  type CompanyTeam,
  type CompanySubscription,
} from "@/core/integrations/integration-types";
