import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ConsumerAuthPanelProps {
  title: string;
  meta?: string;
  description?: ReactNode;
  children: ReactNode;
  /** Bloco interno no rodapé do card (ex.: criar conta). */
  cta?: ReactNode;
  /** Ação externa abaixo do card (ex.: consultar veículo). */
  footer?: ReactNode;
  trust?: readonly string[];
  className?: string;
}

/** Moldura única para todas as telas de autenticação do consumidor. */
export function ConsumerAuthPanel({
  title,
  meta,
  description,
  children,
  cta,
  footer,
  trust,
  className,
}: ConsumerAuthPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:col-start-2 lg:row-start-2", className)}>
      <section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-elevated">
        <header className="border-b border-border pb-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
            {meta ? <p className="text-xs font-medium text-muted-foreground">{meta}</p> : null}
          </div>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </header>

        <div className="mt-4 flex flex-col">
          <div>{children}</div>
          {trust && trust.length > 0 ? (
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
