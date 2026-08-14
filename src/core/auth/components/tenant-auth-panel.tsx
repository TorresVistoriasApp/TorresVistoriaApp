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
      <section className="overflow-hidden rounded-[1.75rem] border border-neutral-200/90 bg-white shadow-[0_20px_50px_-24px_rgb(0_0_0_/_0.22)]">
        <header className="border-b border-neutral-100 px-6 pb-5 pt-6 sm:px-8 sm:pt-7">
          <div className="mb-4 h-1 w-12 rounded-full bg-primary" aria-hidden />
          <h1 className="text-2xl font-black tracking-[-0.025em] text-neutral-950">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{description}</p>
          ) : null}
        </header>
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">{children}</div>
      </section>

      <Link
        to={ROUTES.consultaLanding}
        className="flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-center text-sm text-neutral-600 shadow-[0_8px_24px_-18px_rgb(0_0_0_/_0.18)] transition-colors hover:border-primary/25 hover:text-neutral-950"
      >
        Não é vistoriador?
        <span className="font-semibold text-primary">Consultar veículo</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
      </Link>
    </div>
  );
}
