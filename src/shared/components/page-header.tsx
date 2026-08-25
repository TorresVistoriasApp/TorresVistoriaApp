import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  testId?: string;
  badge?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  testId,
  badge,
}: PageHeaderProps) {
  return (
    <div className={cn("page-header-strip", className)}>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {badge && <p className="ui-eyebrow">{badge}</p>}
          <h1
            className={cn(
              "text-balance text-[1.625rem] font-bold leading-[1.15] sm:text-[1.875rem]",
              badge && "mt-2",
            )}
            data-testid={testId}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex w-full min-w-0 max-w-full shrink-0 flex-wrap items-stretch gap-2 sm:w-auto sm:items-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
