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
    short: "C",
    icon: Check,
    active: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30",
    idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  [ChecklistStatus.NAO_CONFORME]: {
    label: "Não conforme",
    short: "NC",
    icon: X,
    active: "bg-destructive text-white shadow-sm ring-2 ring-destructive/30",
    idle: "bg-red-50 text-destructive hover:bg-red-100",
  },
  [ChecklistStatus.NA]: {
    label: "Não se aplica",
    short: "N/A",
    icon: Minus,
    active: "bg-muted-foreground text-white shadow-sm ring-2 ring-muted-foreground/30",
    idle: "bg-muted text-muted-foreground hover:bg-muted/80",
  },
} as const;

type ChecklistStatusToggleProps = {
  value: string;
  disabled?: boolean;
  onChange: (status: string) => void;
  compact?: boolean;
};

export function ChecklistStatusToggle({
  value,
  disabled,
  onChange,
  compact = false,
}: ChecklistStatusToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
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
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-2 text-xs font-semibold transition-all sm:px-3",
              "touch-target disabled:opacity-50",
              isActive ? config.active : config.idle,
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className={cn(compact && "hidden sm:inline")}>{config.label}</span>
            <span className={cn(!compact && "hidden", "sm:hidden")}>{config.short}</span>
          </button>
        );
      })}
    </div>
  );
}