import { auditService, type AuditEventInput } from "@/core/audit/audit-service";
import type { AuditAppAction } from "@/core/audit/audit-actions";
import { logger } from "@/core/observability/logger";

/** Registra evento de auditoria sem bloquear a operação do usuário. */
export function logAuditEvent(
  action: AuditAppAction,
  input: Omit<AuditEventInput, "action"> = {},
): void {
  void auditService.recordEvent({ action, ...input }).catch((error) => {
    logger.warn("Falha ao registrar evento de auditoria", { action, error });
  });
}
