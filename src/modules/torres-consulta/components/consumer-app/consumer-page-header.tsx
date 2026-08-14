import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ConsumerPageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  className?: string;
  badge?: string;
}

export function ConsumerPageHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Voltar",
  className,
  badge,
}: ConsumerPageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            {badge}
          </span>
        )}
      </div>
    </header>
  );
}
