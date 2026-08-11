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
        "mx-auto w-full space-y-3.5 lg:mx-0",
        wide ? "max-w-lg" : "max-w-[26.5rem]",
        className,
      )}
    >
      <section className="rounded-[1.75rem] border border-white/10 bg-white p-6 shadow-[0_30px_90px_-30px_rgb(0_0_0_/_0.75)] sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-black tracking-[-0.025em] text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </header>
        {children}
      </section>

      <Link
        to={ROUTES.consultaLanding}
        className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-center text-sm text-slate-300 transition-colors hover:border-orange-400/30 hover:bg-orange-400/[0.07] hover:text-white"
      >
        Não é vistoriador?
        <span className="font-semibold text-orange-400">Consultar veículo</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-orange-400" />
      </Link>
    </div>
  );
}
