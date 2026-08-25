import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { useScrollReveal } from "../../hooks/use-scroll-reveal";

const MAX_DELAY_MS = 90;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const delay = Math.min(delayMs, MAX_DELAY_MS);

  return (
    <div
      ref={ref}
      className={cn("landing-reveal", visible && "landing-reveal-visible", className)}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
