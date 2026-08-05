import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface MarketingHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function MarketingHero({
  eyebrow,
  title,
  description,
  children,
  compact = false,
  className,
}: MarketingHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-white via-slate-50/80 to-canvas",
        compact ? "pt-24 pb-10 sm:pt-28 sm:pb-12" : "pt-24 pb-14 sm:pt-28 sm:pb-16",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(234_88_12_/_0.07),transparent_45%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        )}
        <h1
          className={cn(
            "font-black tracking-tight text-foreground",
            eyebrow ? "mt-3" : "",
            compact
              ? "text-2xl sm:text-3xl lg:text-4xl"
              : "text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
