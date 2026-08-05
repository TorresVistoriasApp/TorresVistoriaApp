import type { IntegrationContext, IntegrationResult } from "@/core/integrations/ports/shared";

/** Canais de entrega. Um mesmo evento pode sair por mais de um. */
export const NotificationChannel = {
  IN_APP: "IN_APP",
  EMAIL: "EMAIL",
  PUSH: "PUSH",
  SMS: "SMS",
  WHATSAPP: "WHATSAPP",
} as const;
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationPriority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  URGENT: "URGENT",
} as const;
export type NotificationPriority =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];

export interface NotificationMessage {
  /** Destinatários dentro do tenant. Vazio difunde para toda a empresa. */
  recipientIds: string[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  title: string;
  body: string;
  /** Rota interna aberta ao tocar na notificação. */
  actionPath?: string;
  metadata?: Record<string, string>;
}

/**
 * Porta de notificações.
 *
 * Abstrai o canal para que a regra de negócio ("laudo pronto") não saiba se a
 * entrega será in-app, push ou WhatsApp — isso vira preferência do usuário.
 */
export interface NotificationDispatcherPort {
  dispatch(
    context: IntegrationContext,
    message: NotificationMessage,
  ): Promise<IntegrationResult<{ notificationId: string }>>;

  /** Canais que o usuário aceita receber, por preferência ou consentimento. */
  getEnabledChannels(context: IntegrationContext): Promise<NotificationChannel[]>;
}
