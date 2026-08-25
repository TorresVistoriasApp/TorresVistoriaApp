import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import { getChecklistStatusMeta } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import { cn } from "@/shared/lib/utils";

const EVALUATION_STATUSES = [
  ChecklistStatus.CONFORME,
  ChecklistStatus.NAO_CONFORME,
  ChecklistStatus.NA,
] as const;

type ChecklistStatusToggleProps = {
  value: string;
  disabled?: boolean;
  onChange: (status: string) => void;
  compact?: boolean;
  fullWidth?: boolean;
  variant?: "default" | "segmented";
  className?: string;
};

export function ChecklistStatusToggle({
  value,
  disabled,
  onChange,
  compact = false,
  fullWidth = false,
  variant = "default",
  className,
}: ChecklistStatusToggleProps) {
  const isSegmented = variant === "segmented" || (compact && fullWidth);

  if (isSegmented) {
    return (
      <div
        className={cn("flex w-full gap-1 rounded-lg bg-white/70 p-1 shadow-inner", className)}
        role="group"
        aria-label="Status do item"
      >
        {EVALUATION_STATUSES.map((status) => {
          const meta = getChecklistStatusMeta(status);
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
                "min-h-[36px] flex-1 rounded-md px-1 py-1.5 text-center text-[11px] font-semibold leading-tight transition-colors duration-100",
                "sm:min-h-[34px] sm:text-xs",
                "disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                isActive ? meta.badgeActive : meta.badgeIdle,
              )}
            >
              {meta.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-muted p-0.5",
        fullWidth && "flex w-full",
        className,
      )}
      role="group"
      aria-label="Status do item"
    >
      {EVALUATION_STATUSES.map((status) => {
        const meta = getChecklistStatusMeta(status);
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
              "flex min-h-[40px] flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold transition-colors duration-100 disabled:opacity-50",
              isActive ? meta.badgeActive : meta.badgeIdle,
            )}
          >
            {meta.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
