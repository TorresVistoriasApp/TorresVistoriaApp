import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn("surface-interactive overflow-hidden", className)}>
      {(title || description) && (
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-5 py-4 md:px-6">
          <div>
            {title && <h3 className="text-base font-bold tracking-tight">{title}</h3>}
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
          )}
        </div>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}
