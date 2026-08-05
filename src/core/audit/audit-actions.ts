/**
 * Taxonomia das ações auditáveis.
 *
 * Vive no núcleo porque qualquer camada pode registrar um evento. A tradução
 * para rótulos e cores é apresentação e pertence ao módulo de auditoria.
 */

export const AUDIT_ACTIONS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "EXPORT_PDF",
  "EXPORT_EXCEL",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/** Ações originadas por trigger no banco. */
export const AUDIT_DML_ACTIONS = ["INSERT", "UPDATE", "DELETE"] as const;
export type AuditDmlAction = (typeof AUDIT_DML_ACTIONS)[number];

/** Ações registradas pela aplicação, sem correspondente em DML. */
export const AUDIT_APP_ACTIONS = ["LOGIN", "LOGOUT", "EXPORT_PDF", "EXPORT_EXCEL"] as const;
export type AuditAppAction = (typeof AUDIT_APP_ACTIONS)[number];

export function isAppAuditAction(action: string): action is AuditAppAction {
  return (AUDIT_APP_ACTIONS as readonly string[]).includes(action);
}

export function isDmlAuditAction(action: string): action is AuditDmlAction {
  return (AUDIT_DML_ACTIONS as readonly string[]).includes(action);
}
