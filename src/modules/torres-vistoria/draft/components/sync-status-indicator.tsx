import { cn } from "@/shared/lib/utils";
import type { SyncStatus } from "@/modules/torres-vistoria/draft/types";

const STATUS_CONFIG: Record<
  SyncStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  synced: {
    label: "Sincronizado",
    dotClass: "bg-success",
    textClass: "text-success",
  },
  pending: {
    label: "Alterações pendentes",
    dotClass: "bg-warning",
    textClass: "text-warning",
  },
  saving: {
    label: "Salvando...",
    dotClass: "bg-primary",
    textClass: "text-primary",
  },
  offline: {
    label: "Sem conexão",
    dotClass: "bg-destructive",
    textClass: "text-destructive",
  },
};

type SyncStatusIndicatorProps = {
  status: SyncStatus;
  pendingCount?: number;
  className?: string;
  compact?: boolean;
};

export function SyncStatusIndicator({
  status,
  pendingCount = 0,
  className,
  compact = false,
}: SyncStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold",
        config.textClass,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={config.label}
    >
      <span className={cn("size-2 shrink-0 rounded-full", config.dotClass)} aria-hidden />
      {!compact && <span>{config.label}</span>}
      {status === "pending" && pendingCount > 0 && (
        <span className="ui-metric rounded-full bg-muted px-1.5 text-[10px] font-bold">
          {pendingCount}
        </span>
      )}
    </div>
  );
}
