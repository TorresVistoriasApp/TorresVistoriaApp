import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhotoSubsectionPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function PhotoSubsectionPanel({ title, children, className }: PhotoSubsectionPanelProps) {
  return (
    <section className={cn("space-y-2", className)}>
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
        {title}
      </h4>
      {children}
    </section>
  );
}
