import { useParams, Link } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import { ROUTES } from "@/config/routes";
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
        <ConsumerSurface className="border-dashed px-6 py-10 text-center">
          <p className="text-[17px] font-bold text-foreground">Nada por aqui</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Volte ao histórico para ver suas consultas.
          </p>
          <div className="mt-6">
            <Button asChild variant="outline">
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
          <span className="ui-icon-box h-12 w-12 shrink-0">
            <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-lg font-bold uppercase tracking-[0.08em] text-foreground">
              {identifier}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{consulta.planName}</p>
          </div>
          <span className={`shrink-0 ${getConsumerConsultaStatusClass(consulta.status)}`}>
            {statusLabel}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="ui-microlabel">Plano</dt>
            <dd className="mt-1.5 font-semibold text-foreground">{consulta.planName}</dd>
          </div>
          <div>
            <dt className="ui-microlabel">Data</dt>
            <dd className="mt-1.5 font-semibold text-foreground">
              {formatConsumerConsultaDate(consulta.createdAt)}
            </dd>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <dt className="ui-microlabel">Status</dt>
            <dd className="mt-1.5 font-semibold text-foreground">{statusLabel}</dd>
          </div>
        </dl>

        {consulta.status === ConsultaStatus.PROCESSING && (
          <p className="mt-4 rounded-lg border border-warning-border bg-warning-subtle px-4 py-3 text-sm leading-relaxed text-foreground">
            Sua consulta está em processamento. O relatório será exibido aqui quando estiver
            disponível.
          </p>
        )}

        {consulta.status === ConsultaStatus.FAILED && (
          <p className="mt-4 rounded-lg border border-destructive-border bg-destructive-subtle px-4 py-3 text-sm text-destructive">
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
          <Button asChild className="mt-5 w-full sm:w-auto">
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
