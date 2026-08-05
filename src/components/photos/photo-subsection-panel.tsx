import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhotoSubsectionPanelProps {
  title: string;
  description?: string;
  guidance?: string;
  children: ReactNode;
  className?: string;
}

export function PhotoSubsectionPanel({
  title,
  description,
  guidance,
  children,
  className,
}: PhotoSubsectionPanelProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <header className="space-y-1.5">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
        {guidance && (
          <p className="rounded-lg border border-sky-200/80 bg-sky-50/60 px-3 py-2 text-xs leading-relaxed text-sky-900">
            {guidance}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
