import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Tone = "brand" | "neutral" | "ink";

export function LandingSection({
  children,
  className,
  tone,
  ...props
}: { children: ReactNode; tone?: "surface" | "ink" } & HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "landing-section",
        tone === "surface" && "landing-section-surface",
        tone === "ink" && "landing-section-ink",
        className,
      )}
      {...props}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function LandingCard({
  className,
  interactive,
  featured,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean; featured?: boolean }) {
  return (
    <div
      className={cn(
        "landing-card",
        interactive && "landing-card-interactive",
        featured && "landing-card-featured",
        className,
      )}
      {...props}
    />
  );
}

export function LandingBadge({
  className,
  tone = "brand",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "landing-badge",
        tone === "neutral" && "landing-badge-neutral",
        tone === "ink" && "landing-badge-ink",
        className,
      )}
      {...props}
    />
  );
}

export function LandingEyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("landing-eyebrow", className)} {...props} />;
}

export function LandingIconBox({
  className,
  tone = "brand",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "brand" | "neutral" }) {
  return (
    <span
      className={cn(
        "landing-icon-box",
        tone === "neutral" && "landing-icon-box-neutral",
        className,
      )}
      {...props}
    />
  );
}
