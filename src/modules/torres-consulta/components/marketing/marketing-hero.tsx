import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { LandingEyebrow } from "@/modules/torres-consulta/components/landing/landing-ui";

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
        "landing-hero-bg border-b border-border",
        compact ? "pt-24 pb-10 sm:pt-28 sm:pb-12" : "pt-24 pb-14 sm:pt-28 sm:pb-16",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {eyebrow && <LandingEyebrow className="mb-3">{eyebrow}</LandingEyebrow>}
        <h1
          className={cn(
            "max-w-3xl text-balance font-bold leading-[1.08] text-foreground",
            compact
              ? "text-[1.75rem] sm:text-[2rem] lg:text-[2.25rem]"
              : "text-[2rem] sm:text-[2.5rem] lg:text-[2.875rem]",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-[17px]">
            {description}
          </p>
        )}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
