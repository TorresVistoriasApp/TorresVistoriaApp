import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const DEFAULT_TRUST = ["Dados protegidos", "Conforme LGPD", "Acesso com aprovação"] as const;

interface TenantAuthPanelProps {
  title: string;
  meta?: string;
  description?: ReactNode;
  children: ReactNode;
  /** Bloco no rodapé do formulário (ex.: criar conta). */
  cta?: ReactNode;
  /** Ação externa abaixo do formulário (ex.: consultar veículo). */
  footer?: ReactNode;
  trust?: readonly string[];
  /** Formulários longos omitem a faixa de confiança. */
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
    <div className={cn("flex w-full flex-col", className)}>
      <header className={cn(wide ? "mb-6" : "mb-7")}>
        {meta ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            {meta}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-balance font-bold tracking-[-0.03em] text-foreground",
            wide ? "text-xl" : "text-[1.625rem]",
            meta && "mt-2.5",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2.5 text-[15px] font-medium leading-[1.65] text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div>{children}</div>

      {!wide && trust.length > 0 ? (
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {trust.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {cta ? <div className="mt-8">{cta}</div> : null}
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}
