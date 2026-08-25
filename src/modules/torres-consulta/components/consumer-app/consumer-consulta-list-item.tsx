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
        "group p-4 transition-colors",
        variant === "card" ? "landing-card" : "hover:bg-muted/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-base font-bold tracking-[0.08em] text-foreground">
            {identifier}
          </p>
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

      <div className="mt-4 flex items-center gap-2">
        <Link
          to={ROUTES.consultaAppConsultaDetail(consulta.id)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-muted px-3 text-sm font-semibold text-foreground transition-colors hover:bg-border"
        >
          Ver detalhes
          <ChevronRight className="h-4 w-4 text-subtle-foreground" aria-hidden />
        </Link>
        {downloadable && (
          <a
            href={consulta.documentUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary transition-colors hover:bg-brand-subtle"
            aria-label={`Baixar relatório ${identifier}`}
          >
            <Download className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}
