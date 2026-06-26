import { cn } from "@/lib/utils";
import { ACTION_LABELS, ACTION_STYLES, type AuditAction } from "@/lib/audit-utils";

type AuditActionBadgeProps = {
  action: string;
  className?: string;
};

export function AuditActionBadge({ action, className }: AuditActionBadgeProps) {
  const normalized = action as AuditAction;
  const label = ACTION_LABELS[normalized] ?? action;
  const style = ACTION_STYLES[normalized] ?? "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
