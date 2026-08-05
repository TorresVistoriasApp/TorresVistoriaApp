import type { IntegrationResult } from "@/core/integrations/ports/shared";

/**
 * Modelos transacionais do ecossistema.
 *
 * O conteúdo vive no provedor (Resend, SendGrid, SES) e não no bundle: assim
 * marketing ajusta o texto sem exigir deploy da aplicação.
 */
export const EmailTemplate = {
  USER_INVITATION: "USER_INVITATION",
  PASSWORD_RESET: "PASSWORD_RESET",
  INSPECTION_REPORT_READY: "INSPECTION_REPORT_READY",
  CONSULTA_RESULT_READY: "CONSULTA_RESULT_READY",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  CREDITS_LOW: "CREDITS_LOW",
  SUBSCRIPTION_EXPIRING: "SUBSCRIPTION_EXPIRING",
} as const;
export type EmailTemplate = (typeof EmailTemplate)[keyof typeof EmailTemplate];

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Blob;
  contentType: string;
}

export interface EmailMessage {
  to: EmailRecipient[];
  template: EmailTemplate;
  /** Variáveis interpoladas no template pelo provedor. */
  variables: Record<string, string | number>;
  attachments?: EmailAttachment[];
  replyTo?: EmailRecipient;
}

/** Porta de envio de e-mail transacional. */
export interface EmailSenderPort {
  send(message: EmailMessage): Promise<IntegrationResult<{ messageId: string }>>;
}
