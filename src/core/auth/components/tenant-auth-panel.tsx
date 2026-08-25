import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ROUTES } from "@/config/routes";
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
    <div
      className={cn(
        "mx-auto w-full space-y-4 lg:mx-0",
        wide ? "max-w-lg" : "max-w-[27rem]",
        className,
      )}
    >
      <section className="ui-panel-elevated overflow-hidden rounded-2xl">
        <header className="border-b border-border px-6 pb-5 pt-6 sm:px-8 sm:pt-7">
          <div className="mb-4 h-1 w-12 rounded-full bg-primary" aria-hidden />
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </header>
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">{children}</div>
      </section>

      <Link
        to={ROUTES.consultaLanding}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5 text-center text-sm text-muted-foreground shadow-soft transition-colors duration-150 hover:text-foreground"
      >
        Não é vistoriador?
        <span className="font-semibold text-primary">Consultar veículo</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
      </Link>
    </div>
  );
}
