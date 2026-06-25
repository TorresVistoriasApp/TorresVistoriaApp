import { ChecklistStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { Check, Minus, X } from "lucide-react";

const EVALUATION_STATUSES = [
  ChecklistStatus.CONFORME,
  ChecklistStatus.NAO_CONFORME,
  ChecklistStatus.NA,
] as const;

const STATUS_CONFIG = {
  [ChecklistStatus.CONFORME]: {
    label: "Conforme",
    mobileLabel: "Conforme",
    icon: Check,
    active: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30",
    idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200",
  },
  [ChecklistStatus.NAO_CONFORME]: {
    label: "Não conforme",
    mobileLabel: "Não conf.",
    icon: X,
    active: "bg-destructive text-white shadow-sm ring-2 ring-destructive/30",
    idle: "bg-red-50 text-destructive hover:bg-red-100 active:bg-red-200",
  },
  [ChecklistStatus.NA]: {
    label: "Não se aplica",
    mobileLabel: "N/A",
    icon: Minus,
    active: "bg-muted-foreground text-white shadow-sm ring-2 ring-muted-foreground/30",
    idle: "bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted",
  },
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
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const isActive = value === status;

        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(status)}
            title={config.label}
            aria-label={config.label}
            aria-pressed={isActive}
            className={cn(
              "flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 disabled:opacity-50",
              fullWidth ? "min-h-[52px] flex-1 px-1 py-2" : "min-h-[44px] gap-1.5 px-2 py-2.5 text-xs",
              stackedMobile ? "flex-col gap-1" : "flex-row gap-1.5 text-xs",
              isActive ? config.active : config.idle,
            )}
          >
            <Icon className="size-4 shrink-0" />
            {stackedMobile ? (
              <>
                <span className="text-center text-[10px] font-bold leading-tight sm:hidden">
                  {config.mobileLabel}
                </span>
                <span className="hidden text-xs sm:inline">{config.label}</span>
              </>
            ) : compact ? (
              <>
                <span className="sm:hidden">{config.mobileLabel}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </>
            ) : (
              <span>{config.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
