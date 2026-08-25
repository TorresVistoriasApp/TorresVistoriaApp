import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ConsumerAuthPanelProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Moldura única para todas as telas de autenticação do consumidor. */
export function ConsumerAuthPanel({
  title,
  description,
  children,
  footer,
  className,
}: ConsumerAuthPanelProps) {
  return (
    <div className={cn("w-full max-w-[26rem]", className)}>
      <div className="rounded-xl border border-border bg-card p-6 shadow-card sm:p-7">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
