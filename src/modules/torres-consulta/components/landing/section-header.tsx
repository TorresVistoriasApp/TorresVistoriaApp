import { cn } from "@/shared/lib/utils";
import { LandingEyebrow } from "./landing-ui";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  titleId?: string;
  onDark?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleId,
  onDark = false,
}: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <LandingEyebrow>{eyebrow}</LandingEyebrow>}
      <h2
        id={titleId}
        className={cn(
          "text-balance font-bold leading-[1.12]",
          onDark ? "text-ink-foreground" : "text-foreground",
          eyebrow && "mt-3",
          align === "center"
            ? "text-[1.75rem] sm:text-[2rem] lg:text-[2.375rem]"
            : "text-[1.625rem] sm:text-[1.875rem] lg:text-[2.125rem]",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3.5 text-pretty text-[15px] leading-relaxed sm:text-base",
            onDark ? "text-ink-muted" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
