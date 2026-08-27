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
      {eyebrow && <LandingEyebrow onDark={onDark}>{eyebrow}</LandingEyebrow>}
      <h2
        id={titleId}
        className={cn(
          "text-balance font-bold leading-[1.1] tracking-[-0.025em]",
          onDark ? "text-white" : "text-foreground",
          eyebrow && "mt-3.5",
          align === "center"
            ? "text-[1.875rem] sm:text-[2.125rem] lg:text-[2.5rem]"
            : "text-[1.75rem] sm:text-[2rem] lg:text-[2.25rem]",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 max-w-xl text-pretty text-[15px] font-medium leading-[1.7] sm:text-base",
            align === "center" && "mx-auto",
            onDark ? "text-white/55" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
