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
    <div
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/90 shadow-[0_12px_40px_rgb(15_23_42_/_0.06)] backdrop-blur-sm",
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
  icon?: ReactNode;
}

export function ConsumerSurfaceHeader({ title, description, icon }: ConsumerSurfaceHeaderProps) {
  return (
    <div className="flex items-start gap-3 border-b border-border/40 pb-4">
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
