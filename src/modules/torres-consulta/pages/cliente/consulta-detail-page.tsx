import { useParams, Link } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { Button } from "@/shared/ui/button";
import { ConsumerPageHeader } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import { ConsumerSurface } from "@/modules/torres-consulta/components/consumer-app/consumer-surface";
import { useConsumerConsulta } from "@/modules/torres-consulta/hooks/use-consumer-consultas";
import { ConsultaStatus } from "@/modules/torres-consulta/domain/entities/consulta";
import {
  canDownloadConsumerConsulta,
  formatConsumerConsultaDate,
  getConsumerConsultaIdentifier,
  getConsumerConsultaStatusClass,
  getConsumerConsultaStatusLabel,
} from "@/modules/torres-consulta/utils/consumer-consulta-presentation";

export function ClienteConsultaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: consulta, isLoading } = useConsumerConsulta(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!consulta) {
    return (
      <div className="space-y-6">
        <ConsumerPageHeader
          title="Consulta não encontrada"
          subtitle="Ela pode ter sido removida ou não pertence à sua conta."
          backTo={ROUTES.consultaAppConsultas}
          backLabel="Minhas consultas"
        />
        <ConsumerSurface className="py-8">
          <EmptyState
            title="Nada por aqui"
            description="Volte ao histórico para ver suas consultas."
          />
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link to={ROUTES.consultaAppConsultas}>Voltar ao histórico</Link>
            </Button>
          </div>
        </ConsumerSurface>
      </div>
    );
  }

  const identifier = getConsumerConsultaIdentifier(consulta);
  const statusLabel = getConsumerConsultaStatusLabel(consulta.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ConsumerPageHeader
        title="Detalhe da consulta"
        subtitle={identifier}
        backTo={ROUTES.consultaAppConsultas}
        backLabel="Minhas consultas"
        badge={statusLabel}
      />

      <ConsumerSurface>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-lg font-black tracking-tight text-foreground">{identifier}</p>
            <p className="mt-1 text-sm text-muted-foreground">{consulta.planName}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getConsumerConsultaStatusClass(
              consulta.status,
            )}`}
          >
            {statusLabel}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border/40 bg-muted/20 p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plano</dt>
            <dd className="mt-1 font-semibold text-foreground">{consulta.planName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</dt>
            <dd className="mt-1 font-semibold text-foreground">
              {formatConsumerConsultaDate(consulta.createdAt)}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</dt>
            <dd className="mt-1 font-semibold text-foreground">{statusLabel}</dd>
          </div>
        </dl>

        {consulta.status === ConsultaStatus.PROCESSING && (
          <p className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            Sua consulta está em processamento. O relatório será exibido aqui quando estiver
            disponível.
          </p>
        )}

        {consulta.status === ConsultaStatus.FAILED && (
          <p className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {consulta.failureReason ?? "A consulta não foi concluída."}
          </p>
        )}

        {consulta.status === ConsultaStatus.COMPLETED && !consulta.resultPayload && (
          <p className="mt-4 text-sm text-muted-foreground">
            Consulta concluída. O relatório detalhado será exibido quando a integração estiver
            completa.
          </p>
        )}

        {canDownloadConsumerConsulta(consulta) && (
          <Button asChild className="mt-5 w-full rounded-full sm:w-auto">
            <a href={consulta.documentUrl!} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Baixar relatório
            </a>
          </Button>
        )}
      </ConsumerSurface>
    </div>
  );
}
