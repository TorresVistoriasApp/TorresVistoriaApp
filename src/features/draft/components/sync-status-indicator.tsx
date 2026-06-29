import { cn } from "@/lib/utils";
import type { SyncStatus } from "@/features/draft/types";

const STATUS_CONFIG: Record<
  SyncStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  synced: {
    label: "Sincronizado",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-800",
  },
  pending: {
    label: "Alterações pendentes",
    dotClass: "bg-amber-400",
    textClass: "text-amber-900",
  },
  saving: {
    label: "Salvando...",
    dotClass: "bg-sky-500 animate-pulse",
    textClass: "text-sky-900",
  },
  offline: {
    label: "Sem conexão",
    dotClass: "bg-red-500",
    textClass: "text-red-800",
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
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium",
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
        <span className="rounded-full bg-amber-100 px-1.5 text-[10px] text-amber-900">
          {pendingCount}
        </span>
      )}
    </div>
  );
}
