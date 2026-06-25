import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {badge && (
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {badge}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid={testId}>
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex w-full shrink-0 flex-wrap items-stretch gap-2 sm:w-auto sm:items-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
