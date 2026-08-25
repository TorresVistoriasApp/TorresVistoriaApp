import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ConsumerSurfaceProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function ConsumerSurface({ children, className, padding = "md" }: ConsumerSurfaceProps) {
  return (
    <div className={cn("landing-card", paddingMap[padding], className)}>{children}</div>
  );
}

interface ConsumerSurfaceHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function ConsumerSurfaceHeader({ title, description, icon }: ConsumerSurfaceHeaderProps) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-4">
      {icon && <span className="landing-icon-box h-9 w-9 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
