import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function ChartWrapper({
  title,
  description,
  children,
  className,
  icon: Icon,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className={cn("ui-panel ui-panel-interactive overflow-hidden", className)}>
      {(title || description) && (
        <div className="ui-panel-header">
          <div className="min-w-0">
            {title && <h3 className="text-[17px] font-bold text-foreground">{title}</h3>}
            {description && (
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <span className="ui-icon-box h-10 w-10">
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
          )}
        </div>
      )}
      <div className="ui-panel-body">{children}</div>
    </div>
  );
}
