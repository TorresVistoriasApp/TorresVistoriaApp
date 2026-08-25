import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ConsumerSurfaceProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export function ConsumerSurface({
  children,
  className,
  padding = "md",
  interactive,
}: ConsumerSurfaceProps) {
  return (
    <div
      className={cn(
        "ui-panel",
        interactive && "ui-panel-interactive",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ConsumerSurfaceHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function ConsumerSurfaceHeader({
  title,
  description,
  icon: Icon,
  action,
}: ConsumerSurfaceHeaderProps) {
  return (
    <div className="ui-panel-header">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="ui-icon-box h-10 w-10" aria-hidden>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
