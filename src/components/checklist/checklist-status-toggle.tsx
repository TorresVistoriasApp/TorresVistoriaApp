import { ChecklistStatus } from "@/lib/enums";
import { getChecklistStatusMeta } from "@/lib/checklist-status";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Circle } from "lucide-react";

const EVALUATION_STATUSES = [
  ChecklistStatus.CONFORME,
  ChecklistStatus.NAO_CONFORME,
  ChecklistStatus.NA,
] as const;

const STATUS_ICONS = {
  [ChecklistStatus.CONFORME]: Check,
  [ChecklistStatus.NAO_CONFORME]: AlertTriangle,
  [ChecklistStatus.NA]: Circle,
} as const;

type ChecklistStatusToggleProps = {
  value: string;
  disabled?: boolean;
  onChange: (status: string) => void;
  compact?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function ChecklistStatusToggle({
  value,
  disabled,
  onChange,
  compact = false,
  fullWidth = false,
  className,
}: ChecklistStatusToggleProps) {
  const stackedMobile = (compact || fullWidth) && fullWidth;

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-border bg-muted/40 p-1",
        fullWidth && "flex w-full",
        className,
      )}
      role="group"
      aria-label="Status do item"
    >
      {EVALUATION_STATUSES.map((status) => {
        const meta = getChecklistStatusMeta(status);
        const Icon = STATUS_ICONS[status];
        const isActive = value === status;

        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(status)}
            title={meta.label}
            aria-label={meta.label}
            aria-pressed={isActive}
            className={cn(
              "flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 disabled:opacity-50",
              fullWidth ? "min-h-[52px] flex-1 px-1 py-2" : "min-h-[44px] gap-1.5 px-2 py-2.5 text-xs",
              stackedMobile ? "flex-col gap-1" : "flex-row gap-1.5 text-xs",
              isActive ? meta.badgeActive : meta.badgeIdle,
            )}
          >
            <Icon className="size-4 shrink-0" />
            {stackedMobile ? (
              <>
                <span className="text-center text-[10px] font-bold leading-tight sm:hidden">
                  {meta.mobileLabel}
                </span>
                <span className="hidden text-xs sm:inline">{meta.label}</span>
              </>
            ) : compact ? (
              <>
                <span className="sm:hidden">{meta.mobileLabel}</span>
                <span className="hidden sm:inline">{meta.label}</span>
              </>
            ) : (
              <span>{meta.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
