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
        className={cn(
          "flex w-full gap-1.5 rounded-lg bg-muted/50 p-1",
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
                "min-h-[40px] flex-1 rounded-md px-1.5 py-2 text-center text-[10px] font-semibold leading-tight transition-all duration-150 sm:min-h-[36px] sm:text-xs",
                "disabled:opacity-50",
                isActive
                  ? cn(meta.badgeActive, "shadow-sm")
                  : "bg-transparent text-muted-foreground hover:bg-background/80",
              )}
            >
              <span className="hidden sm:inline">{meta.label}</span>
              <span className="sm:hidden">{meta.mobileLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

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
