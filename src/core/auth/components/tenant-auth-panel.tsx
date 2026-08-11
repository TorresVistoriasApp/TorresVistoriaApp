import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface TenantAuthPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Formulários longos (cadastro) ganham mais respiro horizontal. */
  wide?: boolean;
  className?: string;
}

export function TenantAuthPanel({
  title,
  description,
  children,
  wide = false,
  className,
}: TenantAuthPanelProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full rounded-[1.75rem] border border-white/10 bg-white p-6 shadow-[0_30px_90px_-30px_rgb(0_0_0_/_0.75)] sm:p-8 lg:mx-0",
        wide ? "max-w-lg" : "max-w-[26.5rem]",
        className,
      )}
    >
      <header className="mb-6">
        <h1 className="text-2xl font-black tracking-[-0.025em] text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
