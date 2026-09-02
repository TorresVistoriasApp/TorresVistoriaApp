/**
 * Convenção: `<domínio>.<verbo-no-passado>`.
 */
export const EventNames = {
  CONSULTA_REQUESTED: "consulta.requested",
  CONSULTA_COMPLETED: "consulta.completed",
  CONSULTA_FAILED: "consulta.failed",
  PAYMENT_CONFIRMED: "payment.confirmed",
  PDF_GENERATED: "pdf.generated",
  EMAIL_SENT: "email.sent",
  DASHBOARD_INVALIDATED: "dashboard.invalidated",
  AUDIT_LOGGED: "audit.logged",
} as const;

export type KnownEventName = (typeof EventNames)[keyof typeof EventNames];
