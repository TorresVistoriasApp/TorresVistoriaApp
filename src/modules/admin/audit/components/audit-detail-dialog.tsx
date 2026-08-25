import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { AuditActionBadge } from "@/modules/admin/audit/components/audit-action-badge";
import { getAuditChanges, getAuditMetadataEntries, getAuditSummary, getEntityLabel } from "@/modules/admin/audit/utils/audit-presentation";
import { isAppAuditAction } from "@/core/audit/audit-actions";
import { formatDateTime } from "@/shared/lib/formatters";
import type { AuditLogWithUser } from "@/core/audit/audit-service";
import { cn } from "@/shared/lib/utils";

type AuditDetailDialogProps = {
  log: AuditLogWithUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-foreground sm:text-right">{value}</dd>
    </div>
  );
}

export function AuditDetailDialog({ log, open, onOpenChange }: AuditDetailDialogProps) {
  if (!log) return null;

  const changes = getAuditChanges(log.old_data, log.new_data);
  const metadataEntries = getAuditMetadataEntries(log.new_data);
  const summary = getAuditSummary(log);
  const isAppEvent = isAppAuditAction(log.action);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,720px)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 sm:px-6 sm:pb-6">
          <DialogHeader className="space-y-3 pb-5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <AuditActionBadge action={log.action} />
              <span className="text-sm text-muted-foreground">{getEntityLabel(log.entity_type)}</span>
            </div>
            <DialogTitle className="text-xl">{summary}</DialogTitle>
            <DialogDescription>
              {formatDateTime(log.created_at)}
              {log.user?.full_name ? ` · ${log.user.full_name}` : ""}
            </DialogDescription>
          </DialogHeader>

          <dl className="space-y-3 rounded-lg border border-border bg-muted p-4">
            <MetadataRow label="Usuário" value={log.user?.full_name ?? "Sistema"} />
            <MetadataRow label="Entidade" value={getEntityLabel(log.entity_type)} />
            <MetadataRow label="ID do registro" value={log.entity_id ?? "—"} />
            {log.ip_address && <MetadataRow label="IP" value={String(log.ip_address)} />}
            {log.user_agent && (
              <MetadataRow label="Navegador" value={log.user_agent} />
            )}
          </dl>

          {isAppEvent && metadataEntries.length > 0 ? (
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Detalhes do evento</h3>
              <dl className="space-y-3 rounded-lg border border-border bg-muted p-4">
                {metadataEntries.map((entry) => (
                  <MetadataRow key={entry.label} label={entry.label} value={entry.value} />
                ))}
              </dl>
            </div>
          ) : changes.length > 0 ? (
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {log.action === "UPDATE" ? "Campos alterados" : "Dados registrados"}
              </h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Campo
                      </th>
                      {log.action === "UPDATE" && (
                        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Antes
                        </th>
                      )}
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {log.action === "UPDATE" ? "Depois" : "Valor"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((change) => (
                      <tr key={change.field} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 font-medium">{change.label}</td>
                        {log.action === "UPDATE" && (
                          <td className="px-4 py-2.5 text-muted-foreground">{change.before}</td>
                        )}
                        <td
                          className={cn(
                            "px-4 py-2.5",
                            log.action === "UPDATE" && change.before !== change.after
                              ? "font-medium text-foreground"
                              : "text-foreground",
                          )}
                        >
                          {log.action === "UPDATE" ? change.after : change.after || change.before}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              Nenhum detalhe adicional disponível para este evento.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
