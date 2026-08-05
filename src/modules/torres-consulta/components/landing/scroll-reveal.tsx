import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { useScrollReveal } from "@/modules/torres-consulta/hooks/use-scroll-reveal";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn("landing-reveal", visible && "landing-reveal-visible", className)}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
