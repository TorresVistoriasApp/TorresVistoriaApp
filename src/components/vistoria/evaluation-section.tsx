import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  statusText?: string;
  statusTone?: "default" | "success" | "warning" | "muted";
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  optional?: boolean;
  dense?: boolean;
  children: ReactNode;
  className?: string;
}

const toneClasses = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  muted: "bg-muted text-muted-foreground",
} as const;

export function EvaluationSection({
  id,
  title,
  subtitle,
  statusText,
  statusTone = "default",
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  optional = false,
  dense = false,
  children,
  className,
}: EvaluationSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 overflow-hidden rounded-lg border border-border/80 bg-card transition-shadow",
        !dense && "shadow-soft",
        open && "ring-1 ring-primary/10",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 text-left transition-colors hover:bg-muted/20",
          dense ? "px-3 py-2.5 sm:px-3.5" : "px-3.5 py-3.5 sm:px-4 sm:py-4",
        )}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className={cn("font-semibold text-foreground", dense ? "text-sm" : "text-sm sm:text-base")}>
              {title}
            </h2>
            {optional && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Opcional
              </span>
            )}
            {statusText && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs",
                  toneClasses[statusTone],
                )}
              >
                {statusText}
              </span>
            )}
          </div>
          {subtitle && !open && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-border/50 px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5 sm:pt-3">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
