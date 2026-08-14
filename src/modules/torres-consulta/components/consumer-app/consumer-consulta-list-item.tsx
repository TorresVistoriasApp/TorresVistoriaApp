import { Link } from "react-router-dom";
import { ChevronRight, Download } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { ConsumerConsulta } from "@/modules/torres-consulta/domain/entities/consumer-consulta";
import {
  canDownloadConsumerConsulta,
  formatConsumerConsultaDate,
  getConsumerConsultaIdentifier,
  getConsumerConsultaStatusClass,
  getConsumerConsultaStatusLabel,
} from "@/modules/torres-consulta/utils/consumer-consulta-presentation";
import { cn } from "@/shared/lib/utils";

interface ConsumerConsultaListItemProps {
  consulta: ConsumerConsulta;
  variant?: "card" | "flat";
}

export function ConsumerConsultaListItem({
  consulta,
  variant = "card",
}: ConsumerConsultaListItemProps) {
  const identifier = getConsumerConsultaIdentifier(consulta);
  const downloadable = canDownloadConsumerConsulta(consulta);

  return (
    <article
      className={cn(
        "group relative overflow-hidden p-4 transition-all",
        variant === "card"
          ? "rounded-[1.25rem] border border-white/80 bg-white/90 shadow-[0_8px_24px_rgb(15_23_42_/_0.05)] backdrop-blur-sm active:scale-[0.99]"
          : "hover:bg-muted/20",
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-base font-bold tracking-wide text-foreground">{identifier}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatConsumerConsultaDate(consulta.createdAt)} · {consulta.planName}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            getConsumerConsultaStatusClass(consulta.status),
          )}
        >
          {getConsumerConsultaStatusLabel(consulta.status)}
        </span>
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <Link
          to={ROUTES.consultaAppConsultaDetail(consulta.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900/[0.04] px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-900/[0.07]"
        >
          Ver detalhes
          <ChevronRight className="h-4 w-4 opacity-60" />
        </Link>
        {downloadable && (
          <a
            href={consulta.documentUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white text-primary shadow-sm transition-colors hover:bg-primary/5"
            aria-label={`Baixar relatório ${identifier}`}
          >
            <Download className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
