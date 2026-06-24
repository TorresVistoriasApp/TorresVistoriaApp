import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChartWrapper({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      {title && <p className="mb-4 text-sm font-medium text-muted-foreground">{title}</p>}
      <div className="min-h-[200px] w-full">{children}</div>
    </div>
  );
}
