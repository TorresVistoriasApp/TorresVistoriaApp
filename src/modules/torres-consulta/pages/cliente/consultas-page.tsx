import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useConsumerConsultas } from "@/modules/torres-consulta/hooks/use-consumer-consultas";
import {
  canDownloadConsumerConsulta,
  formatConsumerConsultaDate,
  getConsumerConsultaIdentifier,
  getConsumerConsultaStatusClass,
  getConsumerConsultaStatusLabel,
} from "@/modules/torres-consulta/utils/consumer-consulta-presentation";

export function ClienteConsultasPage() {
  const { data: consultas, isLoading } = useConsumerConsultas();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!consultas?.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Minhas Consultas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Histórico completo de consultas veiculares realizadas.
          </p>
        </div>
        <EmptyState
          title="Nenhuma consulta realizada"
          description="Realize sua primeira consulta veicular para ver o histórico aqui."
        />
        <div className="text-center">
          <Button asChild>
            <Link to={ROUTES.consultaAppNovaConsulta}>Nova consulta</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Minhas Consultas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico completo de consultas veiculares realizadas.
        </p>
      </div>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Todas as consultas</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Identificador</th>
                <th className="px-5 py-3">Plano</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {consultas.map((consulta) => (
                <tr key={consulta.id} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatConsumerConsultaDate(consulta.createdAt)}
                  </td>
                  <td className="px-5 py-4 font-mono font-semibold">
                    {getConsumerConsultaIdentifier(consulta)}
                  </td>
                  <td className="px-5 py-4">{consulta.planName}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getConsumerConsultaStatusClass(
                        consulta.status,
                      )}`}
                    >
                      {getConsumerConsultaStatusLabel(consulta.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={ROUTES.consultaAppConsultaDetail(consulta.id)}>Ver</Link>
                      </Button>
                      {canDownloadConsumerConsulta(consulta) && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={consulta.documentUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Baixar
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
