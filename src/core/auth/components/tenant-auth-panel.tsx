import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const DEFAULT_TRUST = ["Dados protegidos", "Conforme LGPD", "Acesso com aprovação"] as const;

interface TenantAuthPanelProps {
  title: string;
  meta?: string;
  description?: ReactNode;
  children: ReactNode;
  /** Bloco interno no rodapé do card (ex.: criar conta). */
  cta?: ReactNode;
  /** Ação externa abaixo do card (ex.: consultar veículo). */
  footer?: ReactNode;
  trust?: readonly string[];
  /** Formulários longos (cadastro) omitem a faixa de confiança do login. */
  wide?: boolean;
  className?: string;
}

export function TenantAuthPanel({
  title,
  meta = "Acesso profissional",
  description,
  children,
  cta,
  footer,
  trust = DEFAULT_TRUST,
  wide = false,
  className,
}: TenantAuthPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:col-start-2 lg:row-start-2", className)}>
      <section
        className={cn(
          "flex flex-col rounded-xl border border-border bg-card shadow-elevated",
          wide ? "p-6 sm:p-7" : "p-5",
        )}
      >
        <header className="border-b border-border pb-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className={cn("font-bold text-foreground", wide ? "text-xl" : "text-[17px]")}>
              {title}
            </h2>
            {!wide && meta ? (
              <p className="text-xs font-medium text-muted-foreground">{meta}</p>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </header>

        <div className="mt-4 flex flex-col">
          <div>{children}</div>
          {!wide && trust.length > 0 ? (
            <ul className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {cta ? <div className="mt-4">{cta}</div> : null}
        </div>
      </section>

      {footer ? footer : null}
    </div>
  );
}
