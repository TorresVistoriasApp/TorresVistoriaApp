import { useParams, Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { MobileBackButton } from "@/shared/components/mobile-back-button";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
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
      <div className="space-y-4">
        <EmptyState
          title="Consulta não encontrada"
          description="Ela pode ter sido removida ou não pertence à sua conta."
        />
        <div className="text-center">
          <Button asChild variant="outline">
            <Link to={ROUTES.consultaAppConsultas}>Voltar ao histórico</Link>
          </Button>
        </div>
      </div>
    );
  }

  const identifier = getConsumerConsultaIdentifier(consulta);

  return (
    <div className="space-y-6">
      <MobileBackButton to={ROUTES.consultaAppConsultas} label="Minhas consultas" />

      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Detalhe da consulta</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{identifier}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-muted-foreground">Plano</p>
              <p className="font-semibold">{consulta.planName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-semibold">{formatConsumerConsultaDate(consulta.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getConsumerConsultaStatusClass(
                  consulta.status,
                )}`}
              >
                {getConsumerConsultaStatusLabel(consulta.status)}
              </span>
            </div>
          </div>

          {consulta.status === ConsultaStatus.PROCESSING && (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-muted-foreground">
              Sua consulta está em processamento. O relatório será exibido aqui quando estiver
              disponível.
            </p>
          )}

          {consulta.status === ConsultaStatus.FAILED && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-destructive">
              {consulta.failureReason ?? "A consulta não foi concluída."}
            </p>
          )}

          {consulta.status === ConsultaStatus.COMPLETED && !consulta.resultPayload && (
            <p className="text-muted-foreground">
              Consulta concluída. O relatório detalhado será exibido quando a integração estiver
              completa.
            </p>
          )}

          {canDownloadConsumerConsulta(consulta) && (
            <Button asChild>
              <a href={consulta.documentUrl!} target="_blank" rel="noopener noreferrer">
                Baixar relatório
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
