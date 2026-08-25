import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ConsumerPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Rótulo uppercase acima do título, na cor da marca. */
  eyebrow?: string;
  /** Alias de eyebrow — páginas internas passam `badge`. */
  badge?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function ConsumerPageHeader({
  title,
  subtitle,
  eyebrow,
  badge,
  backTo,
  backLabel = "Voltar",
  actions,
  className,
}: ConsumerPageHeaderProps) {
  const label = eyebrow ?? badge;

  return (
    <header className={cn("page-header-strip", className)}>
      {backTo && (
        <Link
          to={backTo}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
      )}

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {label && <p className="ui-eyebrow">{label}</p>}
          <h1
            className={cn(
              "text-balance text-[1.625rem] font-bold leading-[1.15] sm:text-[1.875rem]",
              label && "mt-2",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center gap-2 sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

interface ConsumerSectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ConsumerSectionHeading({
  title,
  description,
  action,
}: ConsumerSectionHeadingProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
