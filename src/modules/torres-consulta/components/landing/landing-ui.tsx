import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Tone = "brand" | "neutral" | "ink";

export function LandingSection({
  children,
  className,
  tone,
  ...props
}: { children: ReactNode; tone?: "surface" | "ink" | "cinematic" } & HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "landing-section",
        tone === "surface" && "landing-section-surface",
        tone === "ink" && "landing-section-ink",
        tone === "cinematic" && "landing-section-cinematic",
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

export function LandingEyebrow({
  className,
  onDark = false,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { onDark?: boolean }) {
  return (
    <p
      className={cn("landing-eyebrow", onDark && "landing-eyebrow-on-dark", className)}
      {...props}
    />
  );
}

export function LandingIconBox({
  className,
  tone = "brand",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "brand" | "neutral" | "ghost" }) {
  return (
    <span
      className={cn(
        "landing-icon-box",
        tone === "neutral" && "landing-icon-box-neutral",
        tone === "ghost" && "landing-icon-box-ghost",
        className,
      )}
      {...props}
    />
  );
}
